import time
from stemkit_motor import *

STOP = const(0)
BRAKE = const(1)

def stop_robot(then=STOP):
    if then == STOP:
        motor.stop()
    elif then == BRAKE:
        motor.ina1.duty(1023)
        motor.ina2.duty(1023)
        motor.inb1.duty(1023)
        motor.inb2.duty(1023)
        time.sleep_ms(150)
        motor.stop()
    else:
        return


def follow_line(speed, now=None, backward=True):
    status = motor.check_line()

    if status == LINE_END:
        if backward:
            motor.backward(speed)
        return

    if status == LINE_CENTER or status == LINE_CROSS:
        motor.set_wheel_speed(speed, -speed)
    elif status == LINE_RIGHT:
        motor.set_wheel_speed(int(speed * 0.5), -speed)
    elif status == LINE_RIGHT2:
        motor.set_wheel_speed(0, -speed)
    elif status == LINE_RIGHT3:
        motor.set_wheel_speed(int(-speed * 0.5), int(-speed * 0.5))
    elif status == LINE_LEFT:
        motor.set_wheel_speed(speed, int(-speed * 0.5))
    elif status == LINE_LEFT2:
        motor.set_wheel_speed(speed, 0)
    elif status == LINE_LEFT3:
        motor.set_wheel_speed(int(speed * 0.5), int(speed * 0.5))


def follow_line_until_end(speed, timeout=10000, then=STOP):
    count = 3
    last_time = time.ticks_ms()

    while time.ticks_ms() - last_time < timeout:
        if motor.check_line() == LINE_END:
            count = count - 1
            if count == 0:
                break

        if speed >= 0:
            follow_line(speed, backward=False)
        else:
            motor.backward(abs(speed))

        time.sleep_ms(10)

    stop_robot(then)

def follow_line_until_cross(speed, timeout=10000, then=STOP):
    status = 1
    count = 0
    last_time = time.ticks_ms()

    while time.ticks_ms() - last_time < timeout:
        check = motor.check_line()

        if status == 1:
            if check != LINE_CROSS:
                status = 2
        elif status == 2:
            if check == LINE_CROSS:
                count = count + 1
                if count == 2:
                    break

        if speed >= 0:
            follow_line(speed)
        else:
            motor.backward(abs(speed))

        time.sleep_ms(10)

    motor.forward(speed, 0.1)
    stop_robot(then)

def follow_line_until(speed, condition, timeout=10000, then=STOP):
    status = 1
    count = 0
    last_time = time.ticks_ms()

    while time.ticks_ms() - last_time < timeout:
        check = motor.check_line()

        if status == 1:
            if check != LINE_CROSS:
                status = 2
        elif status == 2:
            if condition():
                count = count + 1
                if count == 2:
                    break

        if speed >= 0:
            follow_line(speed)
        else:
            motor.backward(abs(speed))

        time.sleep_ms(10)

    stop_robot(then)

def turn_until_line_detected(m1_speed, m2_speed, timeout=5000, then=STOP):
    counter = 0
    status = 0

    last_time = time.ticks_ms()

    motor.set_wheel_speed(m1_speed, -(m2_speed))

    while time.ticks_ms() - last_time < timeout:
        check = motor.check_line()

        if status == 0:
            if check == LINE_END:
                status = 1

        elif status == 1:
            motor.set_wheel_speed(m1_speed, -(m2_speed))
            status = 2
            counter = 3
        elif status == 2:
            if check != LINE_END:
                motor.set_wheel_speed(int(m1_speed * 0.75), int(-(m2_speed * 0.75)))
                counter = counter - 1
                if counter <= 0:
                    break

        time.sleep_ms(10)

    stop_robot(then)

def turn_until_condition(m1_speed, m2_speed, condition, timeout=5000, then=STOP):
    count = 0

    motor.set_wheel_speed(m1_speed, -m2_speed)

    last_time = time.ticks_ms()

    while time.ticks_ms() - last_time < timeout:
        if condition():
            count = count + 1
            if count == 3:
                break
        time.sleep_ms(10)

    stop_robot(then)


