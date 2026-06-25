# ============================================================================
#  Module "5 Channel Line Finder Array" (STM32G030, I2C slave @0x24).
#  Ban dong goi cho STEM Starter Kit: tu chua (khong phu thuoc line_sensor.py
#  cua firmware loi). Dung chung bus I2C cua kit (pin19=SCL, pin20=SDA).
#
#  CACH DOC: dung TUPLE (thanh ghi 0x06, bit4=S1 .. bit0=S5). STM32 da TU
#  nguong hoa + xu ly reverse -> tra ve 0/1 sach (giong PCF8574 ban 4-mat).
#  Toan bo logic do line tinh tu pattern so (digital), KHONG phu thuoc calib
#  phia MicroPython -> hoat dong on dinh voi cac khoi lenh do line san co.
#  RAW analog chi de hien thi/calib (read_raw, calibrate).
# ============================================================================
from machine import Pin, SoftI2C
from yolobit import *
from micropython import const

# ---- Ban do thanh ghi (khop firmware STM32) ----
LINE5_ADDR        = const(0x24)
LINE5_REG_WHO     = const(0x00)
LINE5_REG_CALIB   = const(0x04)
LINE5_REG_TUPLE   = const(0x06)   # 1 byte digital, bit4=S1 .. bit0=S5
LINE5_REG_RAW     = const(0x10)   # 5 x uint16 LE (S5..S1)
LINE5_REG_LED     = const(0x1A)

# Trong so truc S1..S5 thang +-2000 (am = trai, duong = phai)
LINE5_WEIGHTS  = (-2000, -1000, 0, 1000, 2000)

# ---- Trang thai cham line (khop convention 4-mat) ----
LINE_LEFT3  = const(-3)
LINE_LEFT2  = const(-2)
LINE_LEFT   = const(-1)
LINE_CENTER = const(0)
LINE_RIGHT  = const(1)
LINE_RIGHT2 = const(2)
LINE_RIGHT3 = const(3)
LINE_CROSS  = const(4)
LINE_END    = const(5)

# ---- Checkpoint (10..20, khong dung cham trang thai cham line -3..5) ----
LINE_NORMAL       = const(10)
LINE_LEFT_CORNER  = const(11)
LINE_RIGHT_CORNER = const(12)
LINE_T            = const(13)
LINE_Y            = const(15)
LINE_U_TURN       = const(16)
LINE_LOST         = const(17)
LINE_DASH         = const(18)
LINE_START        = const(19)
LINE_FINISH       = const(20)


class LineSensor5P_I2C:
    def __init__(self, address=LINE5_ADDR):
        self.address = address
        # cache cua update() (doc I2C 1 lan/loop)
        self._pos = None        # centroid [-2000,2000] hoac None
        self._pattern = 0       # bitmask S1..S5
        self._count = 0         # so mat tren line
        self._last_err = 0      # centroid hop le gan nhat (giu huong khi mat line)
        # debounce checkpoint
        self._cp_cand = LINE_NORMAL
        self._cp_n = 0
        self._cp_need = 2
        self._checkpoint = LINE_NORMAL
        self._lost_frames = 0

        try:
            self.i2c = SoftI2C(scl=Pin(pin19.pin), sda=Pin(pin20.pin), freq=400000)
            who = self.i2c.readfrom_mem(address, LINE5_REG_WHO, 1)[0]
            self.ok = (who == address)
            if not self.ok:
                print('5-ch line sensor: bad WHO_AM_I', who)
        except:
            self.i2c = None
            self.ok = False
            print('5-ch line sensor not found')

    # ---- truy cap thanh ghi ----
    def _read(self, reg, n=1):
        if not self.ok:
            return None
        try:
            return self.i2c.readfrom_mem(self.address, reg, n)
        except:
            return None

    def _write(self, reg, val):
        if not self.ok:
            return
        try:
            self.i2c.writeto_mem(self.address, reg, bytes([val & 0xFF]))
        except:
            pass

    # ---- doc TUPLE 0/1 moi mat (S1=trai nhat .. S5=phai nhat) ----
    def read(self, index=None):
        # 0=nen, 1=tren-line. Firmware byte: bit4=S1 .. bit0=S5 -> dao lai.
        data = self._read(LINE5_REG_TUPLE, 1)
        b = data[0] if data else 0
        if index is None:
            return tuple((b >> (4 - i)) & 1 for i in range(5))
        return (b >> (4 - index)) & 1

    # ---- doc RAW analog 12-bit (firmware tra S5..S1 -> dao de index 0 = S1) ----
    def read_raw(self, index=None):
        data = self._read(LINE5_REG_RAW, 10)
        if not data:
            return 0 if index is not None else (0, 0, 0, 0, 0)
        vals = tuple(data[(4 - i) * 2] | (data[(4 - i) * 2 + 1] << 8) for i in range(5))
        return vals[index] if index is not None else vals

    # ---- centroid tu pattern so: tong trong so / so mat, thang [-2000,2000].
    #      am = line lech trai (S1), duong = line lech phai (S5). None khi mat line.
    def _centroid(self, t):
        cnt = 0
        acc = 0
        for i in range(5):
            if t[i]:
                acc += LINE5_WEIGHTS[i]
                cnt += 1
        if cnt == 0:
            return None
        return acc // cnt

    # ---- doc 1 lan/loop, cache pattern/centroid/checkpoint (debounce) ----
    def update(self):
        t = self.read()
        pat = 0
        cnt = 0
        for i in range(5):
            if t[i]:
                pat |= (1 << i)
                cnt += 1
        self._pattern = pat
        self._count = cnt
        self._pos = self._centroid(t)
        if self._pos is not None:
            self._last_err = self._pos

        cand = self._classify()
        if cand == LINE_LOST:
            if self._lost_frames < 10000:
                self._lost_frames += 1
        else:
            self._lost_frames = 0
        if cand == self._cp_cand:
            if self._cp_n < 10000:
                self._cp_n += 1
        else:
            self._cp_cand = cand
            self._cp_n = 1
        if self._cp_n >= self._cp_need:
            self._checkpoint = cand
        return self

    def _classify(self):
        p = self._pattern
        c = self._count
        if c == 0:                              # mat line
            return LINE_LOST
        if c >= 4:                              # 4-5 mat trum -> vach ngang
            return LINE_CROSS
        edgeL = p & 0b00001; edgeR = p & 0b10000
        center = p & 0b00100
        grpL = p & 0b00011; grpR = p & 0b11000
        if edgeL and edgeR and not center:      # 2 mep ngoai sang -> nga Y
            return LINE_Y
        if c == 3:
            if p == 0b00111:
                return LINE_LEFT_CORNER
            if p == 0b11100:
                return LINE_RIGHT_CORNER
            return LINE_NORMAL
        if edgeL and not grpR:
            return LINE_LEFT_CORNER
        if edgeR and not grpL:
            return LINE_RIGHT_CORNER
        return LINE_NORMAL

    # ---- getter doc cache (khong doc I2C) ----
    def get_pattern(self):
        return self._pattern

    def count(self):
        return self._count

    def get_error(self):
        # centroid cho PID; khi mat line giu huong cu de lai line
        if self._pos is not None:
            return self._pos
        if self._last_err > 0:
            return 2000
        elif self._last_err < 0:
            return -2000
        return 0

    def detect_checkpoint(self):
        return self._checkpoint

    def lost_frames(self):
        return self._lost_frames

    def set_debounce(self, frames):
        self._cp_need = max(1, int(frames))

    # ---- vi tri line cho PID: [-2000,2000], None khi mat line ----
    def position(self):
        return self._centroid(self.read())

    # ---- trang thai roi rac (tuong thich follow_line cu) ----
    def check(self):
        t = self.read()
        cnt = sum(t)
        if cnt == 0:
            return LINE_END
        if cnt >= 4:
            return LINE_CROSS
        c = self._centroid(t)
        # Dao dau de khop convention 4-mat: p duong = robot lech phai (line o trai).
        p = -c
        if   p <= -1500: return LINE_LEFT3
        elif p <=  -750: return LINE_LEFT2
        elif p <   -250: return LINE_LEFT
        elif p <=   250: return LINE_CENTER
        elif p <    750: return LINE_RIGHT
        elif p <   1500: return LINE_RIGHT2
        return LINE_RIGHT3

    # ---- dieu khien / cau hinh ----
    def set_white_led(self, on):
        self._write(LINE5_REG_LED, 1 if on else 0)

    def calibrate(self):
        # Kich calib tren STM32 (tu dong nguong hoa cho TUPLE).
        self._write(LINE5_REG_CALIB, 1)
