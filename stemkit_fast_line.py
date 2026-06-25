# ============================================================================
#  Fast Line (PID) - do line toc do cao cho cam bien 5 mat LineSensor5P_I2C.
#  Tham khao Pololu Zumo MazeSolver:
#     correction = Kp*error + Ki*(tong error) + Kd*(error - error_truoc)
#
#  KHAC voi khoi ROBOCON (do line bac thang -> dao dong manh o toc do cao),
#  module nay dieu khien LIEN TUC theo centroid cua line -> bam line muot.
#
#  --- DUNG CHUNG ---
#     from stemkit_line5 import LineSensor5P_I2C
#     from stemkit_fast_line import FastLine5
#     line_5ch = LineSensor5P_I2C()
#     fast_line = FastLine5(sensor=line_5ch)   # dung lai cam bien da khoi tao
#     fast_line.set_pid(0.08, 0, 0.5)
#     fast_line.set_speed(70)
#     fast_line.follow_until(lambda: button_a.is_pressed(), 60000)
#
#  --- HUONG DAN TINH CHINH PID ---
#  Loi error da chuan hoa ve khoang ~[-2, 2] (0 = giua line).
#  Do lai: turn = correction * base_speed -> "correction" la TI LE BE LAI:
#     correction = 0  -> di thang
#     correction = 1  -> pivot (banh trong dung han)
#     correction > 1  -> xoay tai cho (banh trong chay lui)
#  => Muon OM CUA GAT, can correction ~1.0-1.5 luc error=2.0 => Kp ~ 0.5-0.75.
#     (Kp qua nho, vd 0.08, chi cho correction 0.16 -> chi vong cung nhe ->
#      mat line o cua gat. Day la loi pho bien khi robot "chi do duoc duong thang".)
#  1) Dat Ki=0. Bat dau Kp ~0.5, Kd ~0.3 (xem default ben duoi).
#  2) Cua gat ma robot van chay thang ra ngoai -> TANG Kp (0.6, 0.7, ...).
#  3) Duong thang ma robot lac qua lai -> TANG Kd (dap dao dong) hoac giam Kp.
#  4) Robot VOT QUA line / mat line lien tuc khi vao cua -> TANG curve_gain
#     (vd fast_line.curve_gain = 0.9) de no XOAY TAI CHO tim line, it overshoot.
#     Nguoc lai neu robot khung lai qua nhieu o cua thoai -> GIAM curve_gain.
#  5) Chi them Ki rat nho neu robot luon lech ve mot ben (it khi can).
#  Toc do cao kho om cua -> giam base_speed khi tune, on roi tang dan len.
#  Bat set_debug(True) -> in log CSV (xem header ben duoi) roi gui cho AI de
#  phan tich va goi y bo so Kp/Ki/Kd phu hop hon.
#
#  --- DINH DANG LOG DEBUG (CSV) ---
#  FASTLINE,t_ms,s0,s1,s2,s3,s4,error,P,I,D,correction,m1,m2
# ============================================================================
import time
from stemkit_motor import *
from stemkit_line5 import LineSensor5P_I2C

STOP = const(0)
BRAKE = const(1)

# gioi han chong tich luy qua muc (integral windup) khi dung Ki
_INTEGRAL_LIMIT = 1000.0

# trong so truc S1..S5 cho centroid analog (thang [-2, 2])
_WEIGHTS = (-2.0, -1.0, 0.0, 1.0, 2.0)


def _clamp(v, lo, hi):
    return lo if v < lo else (hi if v > hi else v)


class FastLine5:
    def __init__(self, sensor=None, mode='digital'):
        # dung lai cam bien truyen vao (vd line_5ch), neu khong thi tu tao
        self.sensor = sensor if sensor is not None else LineSensor5P_I2C()

        # che do doc vi tri line:
        #  'digital' -> centroid tu 0/1 (9 muc roi rac, on dinh, khong can calib)
        #  'raw'     -> centroid analog lien tuc (muot hon) NHUNG phai calibrate() truoc
        self.mode = mode

        # calib cho che do 'raw'
        self._cal_min = [4095, 4095, 4095, 4095, 4095]
        self._cal_max = [0, 0, 0, 0, 0]
        self._line_high = True       # line cho gia tri raw cao hay thap (tu calib)
        self._calibrated = False
        self._last_aerr = 0.0        # giu huong khi mat line (che do raw)
        self.lost_threshold = 0.5    # tong "do tren line" duoi nguong nay = mat line

        # he so PID mac dinh (thang error ~[-2, 2]).
        # Kp=0.5 -> luc error=2.0 thi correction=1.0 -> pivot duoc qua cua.
        self.kp = 0.5
        self.ki = 0.0
        self.kd = 0.3

        # toc do
        self.base_speed = 60
        self.max_speed = 100

        # giam toc tien khi |error| lon (vao cua / mat line) de tranh vot qua line.
        # 0 = khong giam (luon lao toi); 1 = mat line thi XOAY TAI CHO (khong tien).
        # 0.6-0.9 thuong giup om cua gat & phuc hoi line nhanh, it overshoot.
        self.curve_gain = 0.7

        # trang thai PID
        self.last_error = 0.0
        self.integral = 0.0

        # debug
        self.debug = False
        self.debug_interval = 100   # ms giua 2 lan in
        self._last_dbg = 0

    # ---------------- cau hinh ----------------
    def set_pid(self, kp, ki, kd):
        self.kp = kp
        self.ki = ki
        self.kd = kd

    def set_speed(self, speed, max_speed=100):
        self.base_speed = speed
        self.max_speed = max_speed

    def set_curve_gain(self, gain):
        # 0 = khong giam toc khi cua; 1 = mat line thi xoay tai cho. Thuong 0.6-0.9.
        if gain < 0:
            gain = 0
        elif gain > 1:
            gain = 1
        self.curve_gain = gain

    def set_mode(self, mode):
        # 'digital' (mac dinh, on dinh) hoac 'raw' (analog, muot hon, can calibrate())
        self.mode = mode
        if mode == 'raw' and not self._calibrated:
            print('FastLine5: che do raw chua calibrate -> tam dung digital. Goi calibrate() truoc.')

    def calibrate(self, seconds=3, spin=35):
        # Hoc nguong cho che do 'raw': robot TU XOAY de quet 5 mat qua line + nen,
        # ghi lai min/max moi mat. Dat robot tren/canh line roi goi ham nay.
        # Sau khi xong, vi tri line se duoc tinh lien tuc (muot hon digital).
        self._cal_min = [4095, 4095, 4095, 4095, 4095]
        self._cal_max = [0, 0, 0, 0, 0]
        on_total = 0
        on_count = 0
        off_total = 0
        off_count = 0
        duration = int(seconds * 1000)
        half = duration // 2
        start = time.ticks_ms()
        self._set_wheels(spin, spin)        # xoay 1 chieu
        flipped = False
        while time.ticks_diff(time.ticks_ms(), start) < duration:
            if not flipped and time.ticks_diff(time.ticks_ms(), start) > half:
                self._set_wheels(-spin, -spin)   # xoay nguoc lai de quet day du
                flipped = True
            raw = self.sensor.read_raw()
            dig = self.sensor.read()
            for k in range(5):
                v = raw[k]
                if v < self._cal_min[k]:
                    self._cal_min[k] = v
                if v > self._cal_max[k]:
                    self._cal_max[k] = v
                if dig[k]:
                    on_total += v
                    on_count += 1
                else:
                    off_total += v
                    off_count += 1
            time.sleep_ms(5)
        motor.stop()
        # xac dinh chieu: tren-line cho raw cao hay thap (dua vao digital dang tin)
        if on_count > 0 and off_count > 0:
            self._line_high = (on_total / on_count) > (off_total / off_count)
        self._calibrated = True
        print('FastLine5 calib xong. min=%s max=%s line_high=%s' % (
            self._cal_min, self._cal_max, self._line_high))

    def set_debug(self, on):
        self.debug = bool(on)
        if self.debug:
            # in dong tieu de CSV de tien copy/phan tich
            print('FASTLINE,t_ms,s0,s1,s2,s3,s4,error,P,I,D,correction,m1,m2')

    def set_debug_interval(self, ms):
        self.debug_interval = int(ms)

    def reset_pid(self):
        self.last_error = 0.0
        self.integral = 0.0

    # ---------------- doc gia tri ----------------
    def error(self):
        # loi line da chuan hoa ~[-2, 2] (0 = giua line)
        return self._read_error()

    def read(self):
        # tuple 5 mat (s0..s4), moi mat 0/1
        return self.sensor.read()

    def _read_error(self):
        # tra ve loi line ~[-2, 2] theo che do hien tai
        if self.mode == 'raw' and self._calibrated:
            return self._analog_error()
        return self.sensor.get_error() / 1000.0

    def _analog_error(self):
        # centroid analog lien tuc tu read_raw + calib -> muot hon digital
        raw = self.sensor.read_raw()
        acc = 0.0
        tot = 0.0
        for k in range(5):
            rng = self._cal_max[k] - self._cal_min[k]
            if rng < 1:
                n = 0.0
            else:
                n = (raw[k] - self._cal_min[k]) / rng
                if not self._line_high:
                    n = 1.0 - n
                if n < 0.0:
                    n = 0.0
                elif n > 1.0:
                    n = 1.0
            acc += n * _WEIGHTS[k]
            tot += n
        if tot < self.lost_threshold:
            # mat line -> giu huong cu (giong get_error cua che do digital)
            if self._last_aerr > 0:
                return 2.0
            elif self._last_aerr < 0:
                return -2.0
            return 0.0
        err = acc / tot
        self._last_aerr = err
        return err

    # ---------------- 1 vong PID ----------------
    def step(self):
        self.sensor.update()                # van can: checkpoint cho follow_until_cross
        error = self._read_error()          # ~[-2, 2], theo che do digital/raw

        self.integral = _clamp(self.integral + error, -_INTEGRAL_LIMIT, _INTEGRAL_LIMIT)
        p = self.kp * error
        i = self.ki * self.integral
        d = self.kd * (error - self.last_error)
        correction = p + i + d
        self.last_error = error

        # giam toc tien theo |error|: cua cang gat / mat line -> tien cang cham
        # -> robot xoay tai cho de tim line thay vi lao toi va vot qua.
        ae = abs(error)
        if ae > 2.0:
            ae = 2.0
        fwd = self.base_speed * (1.0 - self.curve_gain * ae / 2.0)

        # do lai van ti le voi base_speed -> giu luc be lai manh ngay ca khi cham
        turn = correction * self.base_speed
        m1 = _clamp(fwd + turn, -self.max_speed, self.max_speed)
        m2 = _clamp(-fwd + turn, -self.max_speed, self.max_speed)
        self._set_wheels(m1, m2)

        if self.debug:
            self._print_dbg(error, p, i, d, correction, m1, m2)
        return error

    def _set_wheels(self, m1, m2):
        # Ghi PWM truc tiep, BO QUA logic chong-soc (sleep 200ms) cua
        # motor.set_wheel_speed -> dieu khien PID muot o toc do cao, khong khung.
        m1 = int(_clamp(m1, -100, 100))
        m2 = int(_clamp(m2, -100, 100))
        if m1 >= 0:
            motor.ina1.duty(int(translate(m1, 0, 100, 0, 1023)))
            motor.ina2.duty(0)
        else:
            motor.ina1.duty(0)
            motor.ina2.duty(int(translate(-m1, 0, 100, 0, 1023)))
        if m2 >= 0:
            motor.inb1.duty(int(translate(m2, 0, 100, 0, 1023)))
            motor.inb2.duty(0)
        else:
            motor.inb2.duty(int(translate(-m2, 0, 100, 0, 1023)))
            motor.inb1.duty(0)
        motor.m1_speed = m1
        motor.m2_speed = m2

    def _print_dbg(self, error, p, i, d, correction, m1, m2):
        now = time.ticks_ms()
        if time.ticks_diff(now, self._last_dbg) < self.debug_interval:
            return
        self._last_dbg = now
        # lay trang thai 5 mat tu CACHE cua update() (cung khung voi error),
        # khong doc I2C lai -> moi dong log nhat quan de phan tich.
        pat = self.sensor.get_pattern()
        print('FASTLINE,%d,%d,%d,%d,%d,%d,%.3f,%.3f,%.3f,%.3f,%.3f,%d,%d' % (
            now, pat & 1, (pat >> 1) & 1, (pat >> 2) & 1, (pat >> 3) & 1, (pat >> 4) & 1,
            error, p, i, d, correction, int(m1), int(m2)))

    # ---------------- cac che do do line ----------------
    def follow_delay(self, seconds, then=STOP):
        # do line trong N giay roi dung
        self.reset_pid()
        timeout = int(seconds * 1000)
        last_time = time.ticks_ms()
        while time.ticks_diff(time.ticks_ms(), last_time) < timeout:
            self.step()
            time.sleep_ms(5)
        self.stop(then)

    def follow_until_cross(self, timeout=10000, then=STOP):
        # do line den khi gap vach ngang (cross). Bo qua cross ban dau neu co.
        self.reset_pid()
        status = 1
        last_time = time.ticks_ms()
        while time.ticks_diff(time.ticks_ms(), last_time) < timeout:
            self.step()
            cp = self.sensor.detect_checkpoint()
            if status == 1:
                if cp != LINE_CROSS:
                    status = 2
            elif status == 2:
                if cp == LINE_CROSS:
                    break
            time.sleep_ms(5)
        self.stop(then)

    def follow_until(self, condition, timeout=10000, then=STOP):
        # do line den khi condition() tra ve True (debounce 2 lan lien tiep)
        self.reset_pid()
        count = 0
        last_time = time.ticks_ms()
        while time.ticks_diff(time.ticks_ms(), last_time) < timeout:
            self.step()
            if condition():
                count += 1
                if count >= 2:
                    break
            else:
                count = 0
            time.sleep_ms(5)
        self.stop(then)

    # ---------------- dung ----------------
    def stop(self, then=STOP):
        if then == BRAKE:
            # phanh chu dong: day het duty roi dung (giong stop_robot ROBOCON)
            motor.ina1.duty(1023)
            motor.ina2.duty(1023)
            motor.inb1.duty(1023)
            motor.inb2.duty(1023)
            time.sleep_ms(150)
        motor.stop()
