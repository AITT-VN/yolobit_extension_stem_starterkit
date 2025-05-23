"""
MicroPython MPR121 capacitive touch keypad and breakout board driver
https://github.com/mcauser/micropython-mpr121

MIT License
Copyright (c) 2018 Mike Causer
"""
from yolobit import *
from micropython import const
import ustruct, time
import _thread
from machine import SoftI2C, Pin
import music

MPR121_TOUCH_STATUS = const(0x00) # (0x00~0x01) Touch status
# (0x02~0x03) Out-of-range status
MPR121_ELECTRODE_FILTERED_DATA = const(0x04) # (0x04~0x1D) Electrode filtered data
MPR121_BASELINE_VALUE = const(0x1E) # (0x1E~0x2A) Baseline value
# (0x2B~0x40) Baseline Filtering Control
MPR121_MAX_HALF_DELTA_RISING = const(0x2B) # Max half delta (rising)
MPR121_NOISE_HALF_DELTA_RISING = const(0x2C) # Noise half delta (rising)
MPR121_NOISE_COUNT_LIMIT_RISING = const(0x2D) # Noise count limit (rising)
MPR121_FILTER_DELAY_COUNT_RISING = const(0x2E) # Filter delay count (rising)
MPR121_MAX_HALF_DELTA_FALLING = const(0x2F) # Max half delta (falling)
MPR121_NOISE_HALF_DELTA_FALLING = const(0x30) # Noise half delta (falling)
MPR121_NOISE_COUNT_LIMIT_FALLING = const(0x31) # Noise count limit (falling)
MPR121_FILTER_DELAY_COUNT_FALLING = const(0x32) # Filter delay count (falling)
MPR121_NOISE_HALF_DELTA_TOUCHED = const(0x33) # Noise half delta (touched)
MPR121_NOISE_COUNT_LIMIT_TOUCHED = const(0x34) # Noise count limit (touched)
MPR121_FILTER_DELAY_COUNT_TOUCHED = const(0x35) # Filter delay count (touched)
MPR121_TOUCH_THRESHOLD = const(0x41) # Touch threshold (0th, += 2 for each electrode up to 11th)
MPR121_RELEASE_THRESHOLD = const(0x42) # Release threshold (0th, += 2 for each electrode up to 11th)
MPR121_DEBOUNCE = const(0x5B)
MPR121_CONFIG1 = const(0x5C) # FFI (first filter iterations), CDC (charge/discharge current)
MPR121_CONFIG2 = const(0x5D) # CDT (charge/discharge time), SFI (second filter iterations), ESI (electrode sample interval)
MPR121_ELECTRODE_CONFIG = const(0x5E) # Electrode configuration register
MPR121_SOFT_RESET = const(0x80) # Soft reset

class MPR121:
    """Driver for the MPR121 capacitive touch keypad and breakout board."""

    KEYS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '#']

    def __init__(self, i2c=None, address=0x5A):
        if i2c == None:
            self.i2c = SoftI2C(scl=Pin(pin19.pin), sda=Pin(pin20.pin), freq=200000)
        else:
            self.i2c = i2c
        self.address = address
        self._input = '' # to save all keys pressed
        self.sound = True
        self.reset()
        _thread.start_new_thread(self.run, ())

    def _register8(self, register, value=None):
        if value is None:
            return self.i2c.readfrom_mem(self.address, register, 1)[0]
        self.i2c.writeto_mem(self.address, register, bytearray([value]))

    def _register16(self, register, value=None):
        if value is None:
            data = self.i2c.readfrom_mem(self.address, register, 2)
            return ustruct.unpack("<H", data)[0]
        self.i2c.writeto_mem(self.address, register, ustruct.pack("<H", value))

    def reset(self):
        """Resets the MPR121 to a default state"""

        # Soft reset
        self._register8(MPR121_SOFT_RESET, 0x63)

        # Reset electrode configuration to defaults - enter stop mode
        # Config registers are read-only unless in stop mode
        self._register8(MPR121_ELECTRODE_CONFIG, 0x00)

        # Check CDT, SFI, ESI configuration is at defaults
        # A soft reset puts CONFIG2 (0x5D) at 0x24
        # Charge Discharge Time, CDT=1 (0.5us charge time)
        # Second Filter Iterations, SFI=0 (4x samples taken)
        # Electrode Sample Interval, ESI=4 (16ms period)
        if self._register8(MPR121_CONFIG2) != 0x24:
            raise RuntimeError('Failed to reset MPR121 to default state')

        # Set touch and release trip thresholds
        self.set_thresholds(15, 7)

        # Configure electrode filtered data and baseline registers
        self._register8(MPR121_MAX_HALF_DELTA_RISING, 0x01)
        self._register8(MPR121_MAX_HALF_DELTA_FALLING, 0x01)
        self._register8(MPR121_NOISE_HALF_DELTA_RISING, 0x01)
        self._register8(MPR121_NOISE_HALF_DELTA_FALLING, 0x05)
        self._register8(MPR121_NOISE_HALF_DELTA_TOUCHED, 0x00)
        self._register8(MPR121_NOISE_COUNT_LIMIT_RISING, 0x0E)
        self._register8(MPR121_NOISE_COUNT_LIMIT_FALLING, 0x01)
        self._register8(MPR121_NOISE_COUNT_LIMIT_TOUCHED, 0x00)
        self._register8(MPR121_FILTER_DELAY_COUNT_RISING, 0x00)
        self._register8(MPR121_FILTER_DELAY_COUNT_FALLING, 0x00)
        self._register8(MPR121_FILTER_DELAY_COUNT_TOUCHED, 0x00)
        self._register8(MPR121_DEBOUNCE, 0x00)
        # First Filter Iterations, FFI=0 (6x samples taken)
        # Charge Discharge Current, CDC=16 (16uA)
        self._register8(MPR121_CONFIG1, 0x10)
        self._register8(MPR121_CONFIG2, 0x20)
        self._register8(MPR121_ELECTRODE_CONFIG, 0x8F)

        self._input = '' # to save all keys pressed

    def set_thresholds(self, touch, release, electrode=None):
        """Sets the touch and release thresholds (0-255) for a single electrode (0-11) or all electrodes"""
        if not 0 <= touch <= 255:
            raise ValueError('Touch must be in range 0-255.')
        if not 0 <= release <= 255:
            raise ValueError('Release must be in range 0-255.')
        f = 0 if electrode is None else electrode
        t = 12 if electrode is None else electrode + 1

        # you can only modify the thresholds when in stop mode
        config = self._register8(MPR121_ELECTRODE_CONFIG)
        if config != 0:
            self._register8(MPR121_ELECTRODE_CONFIG, 0)

        for i in range(f, t):
            self._register8(MPR121_TOUCH_THRESHOLD + i * 2, touch)
            self._register8(MPR121_RELEASE_THRESHOLD + i * 2, release)

        # return to previous mode if temporarily entered stop mode
        if config != 0:
            self._register8(MPR121_ELECTRODE_CONFIG, config)

    def filtered_data(self, electrode):
        """Returns filtered data value for the specified electrode (0-11)"""
        if not 0 <= electrode <= 11:
            raise ValueError('Electrode must be in range 0-11.')
        return self._register16(MPR121_ELECTRODE_FILTERED_DATA + electrode * 2)

    def baseline_data(self, electrode):
        """Returns baseline data value for the specified electrode (0-11)"""
        if not 0 <= electrode <= 11:
            raise ValueError('Electrode must be in range 0-11.')
        return self._register8(MPR121_BASELINE_VALUE + electrode) << 2

    def touched(self):
        """Returns a 12-bit value representing which electrodes are touched. LSB = electrode 0"""
        return self._register16(MPR121_TOUCH_STATUS)

  
    def is_touched(self, electrode):
        if electrode == '*':
            electrode = 10
        if electrode == '#':
            electrode = 11
        z = int(electrode)
        
        if not 0 <= z <= 11:
            raise ValueError('Electrode must be in range 0-11.')
        if z == 0:
            z = 4
        elif z == 11:
            z = 8
        else :
            
            y = 3-(z//3)
            if z % 3 == 0:
                y = y + 1
            x = z - (3-y)*3-1
            z = 4*x + y
        t = self.touched()
        return (t & (1 << z)) != 0
    
    def run(self):
        while True:
            touched = False
            for i in range(len(self.KEYS)):
                if self.is_touched(i):
                    self._input += self.KEYS[i]
                    touched = True
            if touched:
                if self.sound:
                    music.play(['G3:0.5'], wait=True)
                    time.sleep_ms(300)
                else:
                    time.sleep_ms(500)
            else:
                time.sleep_ms(100)
    
    def scan(self):
        for i in range(len(self.KEYS)):
            if self.is_touched(i):
                time.sleep_ms(500)
                return i

        return -1

    def clear(self):
        self._input = ''

    def read(self):
        return self._input

touchpad = MPR121()
