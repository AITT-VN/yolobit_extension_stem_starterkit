import time
from micropython import const
from stemkit_motor import *
from yolobit import *
from machine import Pin, SoftI2C
from utility import *
from ble import *
import gamepad

GAMEPAD_RECEIVER_ADDR = const(0x55)

BTN_FORWARD = '!B516'
BTN_BACKWARD = '!B615'
BTN_LEFT = '!B714'
BTN_RIGHT = '!B814'

MOVE1 = const(0)
MOVE2 = const(1)
MOVE3 = const(2)
MOVE4 = const(3)
MOVE5 = const(4)
MOVE6 = const(5)
MOVE7 = const(6)
MOVE8 = const(7)

BTN_A = '!B11:'
BTN_B = '!B219'
BTN_C = '!B318'
BTN_D = '!B417'

BTN_RELEASED = '!507'


class StemKitRemoteControlMode():

    def __init__(self):
        self._speed = 50
        self._cmd = None
        self._last_cmd = None
        
        self._cmd_handlers = {
            BTN_A: None,
            BTN_B: None,
            BTN_C: None,
            BTN_D: None,
        }
        
        self._i2c_gp = SoftI2C(scl=Pin(22), sda=Pin(21), freq=100000)
        if self._i2c_gp.scan().count(GAMEPAD_RECEIVER_ADDR) == 0:
            self._gamepad_v2 = None
            print('Gamepad V2 Receiver not found {:#x}'.format(GAMEPAD_RECEIVER_ADDR))
        else:
            self._gamepad_v2 = gamepad.GamePadReceiver(self._i2c_gp)
        
        ble.on_receive_msg('string', self.on_ble_cmd_received)

    def on_ble_cmd_received(self, cmd):
        print('New command: ', cmd)
        self._cmd = cmd
    
    def set_command(self, cmd, handler):
        if cmd not in self._cmd_handlers:
            print('Invalid remote control command')
            return

        self._cmd_handlers[cmd] = handler

    def run(self):
        # read command from gamepad v2 receiver if connected
        if self._gamepad_v2 != None:
            # read status
            
            x, y, angle, dir, distance = self._gamepad_v2.read_joystick(0)
            
            self._gamepad_v2.update()

            if self._gamepad_v2._isconnected == True:
                if self._gamepad_v2.data['dpad_up']:
                    self._cmd = BTN_FORWARD
                elif self._gamepad_v2.data['dpad_down']:
                    self._cmd = BTN_BACKWARD
                elif self._gamepad_v2.data['dpad_left']:
                    self._cmd = BTN_LEFT
                elif self._gamepad_v2.data['dpad_right']:
                    self._cmd = BTN_RIGHT
                elif dir == 5:
                    self._cmd = MOVE1
                elif dir == 4:
                    self._cmd = MOVE2
                elif dir == 3:
                    self._cmd = MOVE3
                elif dir == 2:
                    self._cmd = MOVE4
                elif dir == 1:
                    self._cmd = MOVE5
                elif dir == 8:
                    self._cmd = MOVE6
                elif dir == 7:
                    self._cmd = MOVE7
                elif dir == 6:
                    self._cmd = MOVE8
                elif self._gamepad_v2.data['a']:
                    self._cmd = BTN_C
                elif self._gamepad_v2.data['b']:
                    self._cmd = BTN_D
                elif self._gamepad_v2.data['x']:
                    self._cmd = BTN_A
                elif self._gamepad_v2.data['y']:
                    self._cmd = BTN_B
                else:
                    self._cmd = BTN_RELEASED

        if self._cmd != self._last_cmd: # got new command
            self._speed = 20 # reset speed
        else:
            if self._speed < 50:
                self._speed = self._speed + 1
            else:
                self._speed = 50

        if self._cmd == BTN_FORWARD:
            motor.forward(self._speed*2)

        elif self._cmd == BTN_BACKWARD:
            motor.backward(self._speed*2)

        elif self._cmd == BTN_LEFT:
            motor.turn_left(self._speed)

        elif self._cmd == BTN_RIGHT:
            motor.turn_right(self._speed)
            
        elif self._cmd == MOVE1:
            motor.turn_right(self._speed)
            
        elif self._cmd == MOVE5:
            motor.turn_left(self._speed)
            
        elif self._cmd == MOVE3:
            motor.forward(self._speed)
            
        elif self._cmd == MOVE7:
            motor.backward(self._speed)
            
        elif self._cmd == MOVE2:
            motor.set_wheel_speed(self._speed, -(self._speed/2))
            
        elif self._cmd == MOVE4:
            motor.set_wheel_speed(self._speed/2, -self._speed)
            
        elif self._cmd == MOVE6:
            motor.set_wheel_speed(-(self._speed/2), self._speed)
            
        elif self._cmd == MOVE8:
            motor.set_wheel_speed(-self._speed, self._speed/2)
        
        elif self._cmd in self._cmd_handlers:
            if self._cmd_handlers[self._cmd] != None:
                self._cmd_handlers[self._cmd]()
        
        else:
            motor.stop()
        
        self._last_cmd = self._cmd

stemkit_rc_mode = StemKitRemoteControlMode()
