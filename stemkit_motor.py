
from yolobit import *
import machine
import neopixel
from machine import *
import time
from utility import *



class Motor():

    def __init__(self):
        # motor pins
        self.ina1 = PWM(Pin(pin12.pin), freq=500, duty=0)
        self.ina2 = PWM(Pin(pin6.pin), freq=500, duty=0)

        self.inb1 = PWM(Pin(pin10.pin), freq=500, duty=0)
        self.inb2 = PWM(Pin(pin15.pin), freq=500, duty=0)

        self.m1_speed = 0
        self.m2_speed = 0
        self.stop()


    def forward(self, speed, t=None):
        self.set_wheel_speed(speed, speed)
        if t != None:
            time.sleep(t)
            self.stop()

    def backward(self, speed, t=None):
        self.set_wheel_speed(-speed, -speed)
        if t != None:
            time.sleep(t)
            self.stop()

    def turn_right(self, speed, t=None):
        self.set_wheel_speed(speed, -speed)
        if t != None:
            time.sleep(t)
            self.stop()

    def turn_left(self, speed, t=None):
        self.set_wheel_speed(-speed, speed)
        if t != None:
            time.sleep(t)
            self.stop()

    def stop(self):
        self.set_wheel_speed(0, 0)
        time.sleep_ms(20)

    def set_wheel_speed(self, m1_speed, m2_speed):
        # logic to smoothen motion, avoid voltage spike
        # if wheel speed change > 30, need to change to 30 first
        if (m1_speed != 0 and abs(m1_speed - self.m1_speed) > 30) and (m2_speed != 0 and abs(m2_speed - self.m2_speed) > 30):
            if m1_speed > 0:
                # Forward
                self.ina1.duty(int(translate(30, 0, 100, 0, 1023)))
                self.ina2.duty(0)
            elif m1_speed < 0:
                # Backward
                self.ina1.duty(0)
                self.ina2.duty(int(translate(30, 0, 100, 0, 1023)))

            if m2_speed > 0:
                # Forward
                self.inb1.duty(int(translate(30, 0, 100, 0, 1023)))
                self.inb2.duty(0)
            elif m2_speed < 0:
                # Backward
                self.inb1.duty(0)
                self.inb2.duty(int(translate(30, 0, 100, 0, 1023)))

            time.sleep_ms(200)

        if m1_speed > 0:
            # Forward
            self.ina1.duty(int(translate(abs(m1_speed), 0, 100, 0, 1023)))
            self.ina2.duty(0)
        elif m1_speed < 0:
            # Backward
            self.ina1.duty(0)
            self.ina2.duty(int(translate(abs(m1_speed), 0, 100, 0, 1023)))
        else:
            # Release
            self.ina1.duty(0)
            self.ina2.duty(0)

        if m2_speed > 0:
            # Forward
            self.inb1.duty(int(translate(abs(m2_speed), 0, 100, 0, 1023)))
            self.inb2.duty(0)
        elif m2_speed < 0:
            # Backward
            self.inb2.duty(int(translate(abs(m2_speed), 0, 100, 0, 1023)))
            self.inb1.duty(0)
        else:
            # Release
            self.inb1.duty(0)
            self.inb2.duty(0)

        self.m1_speed = m1_speed
        self.m2_speed = m2_speed



stemkit_motor = Motor()


def stop_all():  # override stop function called by app
    motor.stop()

