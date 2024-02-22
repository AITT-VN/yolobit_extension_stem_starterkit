const ColorBlock = '#44cbc6';
const ImgUrl = 'https://github.com/AITT-VN/yolobit_extension_stem_starterkit/tree/main/images/';
// Tiny LED Module

Blockly.Blocks["stemkit_led_tiny"] = {
  init: function () {
    this.jsonInit({
      inputsInline: true,
      colour: ColorBlock,
      nextStatement: null,
      tooltip: "",
      message0: "%5 LED màu %1 đổi %2 thành %3 %4",
      previousStatement: null,
      args0: [
        {
          type: "field_dropdown",
          name: "port",
          "options": [
            [
              "A",
              "pin0"
            ],
            [
              "B",
              "pin1"
            ]
          ],
        },
        {
          type: "field_dropdown",
          name: "option",
          options: [
            ["tất cả", "0"],
            ["1", "1"],
            ["2", "2"],
            ["3", "3"],
            ["4", "4"],
          ],
        },
        { type: "input_value", name: "COLOR" },
        {type: "input_dummy"},
        {
          "type": "field_image",
          "src": ImgUrl + 'rgb.png',
          "width": 30,
          "height": 30,
          "alt": "*",
          "flipRtl": false
        }
      ],
      helpUrl: ""
    });
  },
};

Blockly.Python['stemkit_led_tiny'] = function(block) {
  var port = block.getFieldValue('port');
  var option = block.getFieldValue('option');
  var color = Blockly.Python.valueToCode(block, 'COLOR', Blockly.Python.ORDER_ATOMIC);
  Blockly.Python.definitions_['import_yolobit'] = 'from yolobit import *';
  Blockly.Python.definitions_['import_led_tiny'] = 'from stemkit_rgbled import RGBLed';
  Blockly.Python.definitions_['import_led_tiny_init'] = 'tiny_rgb = RGBLed('+ port +'.pin, 4)';
  // TODO: Assemble Python into code variable.
  var code = "tiny_rgb.show("+ option +", hex_to_rgb("+ color +"))\n";
  return code;
};


// Ultrasonic

Blockly.Blocks['stemkit_ultrasonic_read'] = {
  init: function () {
    this.jsonInit(
      {
        "type": "stemkit_ultrasonic_read",
        "message0": "%2 khoảng cách %1",
        "args0": [
          {
            "type": "field_dropdown",
            "name": "PORT",
            "options": [
              [
                "A",
                "A"
              ],
              [
                "B",
                "B"
              ]
            ]
          },
          {
            "type": "field_image",
            "src": ImgUrl + 'ultrasonic.png',
            "width": 30,
            "height": 30,
            "alt": "*",
            "flipRtl": false
          }
        ],
        "output": null,
        "colour": ColorBlock,
        "tooltip": "Đọc giá trị đo được của cảm biến khoảng cách",
        "helpUrl": ""
      }
    );
  },

};

Blockly.Python['stemkit_ultrasonic_read'] = function (block) {
  var dropdown_port = block.getFieldValue('PORT');
  var port ;
  if (dropdown_port == 'A'){
    port = "stemkit_ultrasonic = HCSR04(trigger_pin=pin0.pin, echo_pin=pin13.pin)\n";
  
  }  else {
    port = "stemkit_ultrasonic = HCSR04(trigger_pin=pin1.pin, echo_pin=pin14.pin)\n";
  }
  Blockly.Python.definitions_['import_yolobit'] = 'from yolobit import *';
  Blockly.Python.definitions_['import_ultrasonic'] = 'from stemkit_hcsr04 import HCSR04\n' + port;
    
  // TODO: Assemble Python into code variable.
  var code = 'stemkit_ultrasonic.distance_cm()';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Blocks['stemkit_ultrasonic_checkdistance'] = {
  init: function () {
    this.jsonInit(
      {
        "type": "stemkit_ultrasonic_checkdistance",
        "message0": "%4 khoảng cách %3 < %1 %2cm",
        "args0": [
          {
            "type": "input_dummy"
          },
          {
            "type": "input_value",
            "name": "DISTANCE",
            "check": "Number"
          },
          {
            "type": "field_dropdown",
            "name": "PORT",
            "options": [
              [
                "A",
                "A"
              ],
              [
                "B",
                "B"
              ]
            ]
          },
          {
            "type": "field_image",
            "src": ImgUrl + 'ultrasonic.png',
            "width": 30,
            "height": 30,
            "alt": "*",
            "flipRtl": false
          }
        ],
        "output": "Boolean",
        "colour": ColorBlock,
        "tooltip": "Kiểm tra xem khoảng cách đo được của cảm biến có lớn hơn giá trị được chọn hay không",
        "helpUrl": ""
      }
    );
  },
};

Blockly.Python['stemkit_ultrasonic_checkdistance'] = function (block) {
  var value_distance = Blockly.Python.valueToCode(block, 'DISTANCE', Blockly.Python.ORDER_ATOMIC);
  var dropdown_port = block.getFieldValue('PORT');
  var port ;
  if (dropdown_port == 'A'){
    port = "stemkit_ultrasonic = HCSR04(trigger_pin=pin0.pin, echo_pin=pin13.pin)\n";
  
  }  else {
    port = "stemkit_ultrasonic = HCSR04(trigger_pin=pin1.pin, echo_pin=pin14.pin)\n";
  }
  Blockly.Python.definitions_['import_yolobit'] = 'from yolobit import *';
  Blockly.Python.definitions_['import_ultrasonic'] = 'from stemkit_hcsr04 import HCSR04\n' + port;
  // TODO: Assemble Python into code variable.
  var code = 'stemkit_ultrasonic.distance_cm() < ' + value_distance;
  return [code, Blockly.Python.ORDER_NONE];
};

// Cảm biến độ ẩm đất
Blockly.Blocks['stemkit_soil_sensor'] = {
  init: function() {
    this.jsonInit(
      {
        "type": "stemkit_soil_sensor",
        "message0": "%2độ ẩm đất (%%) %1",
        "args0": [
          {
            "type": "field_dropdown",
            "name": "NAME",
            "options": [
              [
                "A",
                "pin0"
              ],
              [
                "B",
                "pin1"
              ]
            ]
          },
          {
            "type": "field_image",
            "src": ImgUrl + 'soil.png',
            "width": 30,
            "height": 30,
            "alt": "*",
            "flipRtl": false
          }
        ],
        "output": "Number",
        "colour": ColorBlock,
        "tooltip": "",
        "helpUrl": ""
      }
    );
  }
};

Blockly.Python['stemkit_soil_sensor'] = function(block) {
  Blockly.Python.definitions_['import_yolobit'] = 'from yolobit import *';
  var dropdown_name = block.getFieldValue('NAME');
  // TODO: Assemble Python into code variable.
  var code = 'round(translate(('+dropdown_name+'.read_analog()), 0, 4095, 0, 100))';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Python.ORDER_NONE];
};

// Dual USB Module

Blockly.Blocks['stemkit_dual_usb'] = {
  /**
   * Block for waiting.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit(
      {
        "type": "stemkit_dual_usb",
        "message0": "%3 máy bơm %1 bật %2 %%",
        "args0": [
          {
            "type": "field_dropdown",
            "name": "NAME",
            "options": [
              [
                "A",
                "pin0"
              ],
              [
                "B",
                "pin1"
              ]
            ]
          },
          {
            "type": "input_value",
            "name": "percent",
            "check": "Number"
          },
          {
            "type": "field_image",
            "src": ImgUrl + 'motor.svg',
            "width": 30,
            "height": 30,
            "alt": "*",
            "flipRtl": false
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": ColorBlock,
        "tooltip": "",
        "helpUrl": ""
      }
    );
  }
};

Blockly.Python['stemkit_dual_usb'] = function(block) {
  Blockly.Python.definitions_['import_yolobit'] = 'from yolobit import *';
  var dropdown_name = block.getFieldValue('NAME');
  var value_percent = Blockly.Python.valueToCode(block, 'percent', Blockly.Python.ORDER_ATOMIC);
  // TODO: Assemble Python into code variable.
  var code = ''+dropdown_name+'.write_analog(round(translate('+value_percent+', 0, 100, 0, 1023)))\n';
  return code;
};

Blockly.Blocks['stemkit_move_motor'] = {
  init: function () {
    this.jsonInit(
      {
        "type": "stemkit_move_motor",
        "message0": "%3 M1 %1  M2 %2 (0-100)",
        "args0": [
          {
            "type": "input_value",
            "name": "left_wheel_speed",
            "check": "Number",
          },
          {
            "type": "input_value",
            "name": "right_wheel_speed",
            "check": "Number",
          },
          {
            "type": "field_image",
            "src": ImgUrl + 'move.svg',
            "width": 30,
            "height": 30,
            "alt": "*",
            "flipRtl": false
          }
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": ColorBlock,
      }
    );
  }
};

Blockly.Python["stemkit_move_motor"] = function (block) {
  Blockly.Python.definitions_['import_stemkit_motor'] = 'from stemkit_motor import *';
  var left_wheel_speed = Blockly.Python.valueToCode(block, 'left_wheel_speed', Blockly.Python.ORDER_ATOMIC);
  var right_wheel_speed = Blockly.Python.valueToCode(block, 'right_wheel_speed', Blockly.Python.ORDER_ATOMIC);
  // TODO: Assemble Python into code variable.
  var code = "stemkit_motor.set_wheel_speed(" + left_wheel_speed + ", " + right_wheel_speed + ")\n";
  return code;
};

Blockly.Blocks['motor_stop'] = {
  init: function () {
    this.jsonInit({
      "type": "motor_stop",
      "message0": "%1 dừng động cơ",
      "args0": [
        {
          "type": "field_image",
          "src": ImgUrl + 'stop.svg',
          "width": 30,
          "height": 30,
          "alt": "",
          "flipRtl": false
        }
        ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": ColorBlock,
    });
  }
};

Blockly.Python["motor_stop"] = function (block) {
  Blockly.Python.definitions_['import_stemkit_motor'] = 'from stemkit_motor import *';
  // TODO: Assemble Python into code variable.
  var code = "stemkit_motor.stop()\n";
  return code;
};

Blockly.Blocks["servo_write_angle"] = {
  init: function () {
    this.jsonInit({
      colour: ColorBlock,
      nextStatement: null,
      message0: "%3 %2 quay đến góc %1 (0-180)",
      previousStatement: null,
      args0: [
        { type: "input_value", name: "angle", check: "Number" },
        {
          type: "field_dropdown",
          name: "pin",
          options: [
            ["S1", "1"],
            ["S2", "2"],
          ],
        },
        {
          "type": "field_image",
          "src": ImgUrl + 'servo.png',
          "width": 30,
          "height": 30,
          "alt": "*",
          "flipRtl": false
        }
      ],
      helpUrl: null,
    });
  },
};

Blockly.Python['servo_write_angle'] = function (block) {
  Blockly.Python.definitions_['import_stemkit_motor'] = 'from stemkit_motor import *';
  var value_output = Blockly.Python.valueToCode(block, 'angle', Blockly.Python.ORDER_ATOMIC);
  var dropdown_pin = block.getFieldValue('pin');
  var code = '';
  if (dropdown_pin == '1'){
    code = 'pin11.servo_write('+ value_output + ')\n';
  }
  else{
    code = 'pin16.servo_write('+ value_output + ')\n';
  }  
  return code;
};

Blockly.Blocks['servo360_write'] = {
  init: function () {
    this.jsonInit(
      {
        "type": "servo360_write",
        "message0": "%3 %1 quay %2 (0-100)",
        "args0": [
          {
            type: "field_dropdown",
            name: "pin",
            options: [
              ["S1", "1"],
              ["S2", "2"],
            ],
          },
          {
            "type": "input_value",
            "name": "speed",
            "check": "Number"
          },
          {
            "type": "field_image",
            "src": ImgUrl + 'servo.png',
            "width": 30,
            "height": 30,
            "alt": "*",
            "flipRtl": false
          }
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        colour: ColorBlock
      }
    );
  }
};

Blockly.Python['servo360_write'] = function (block) {
  Blockly.Python.definitions_['import_stemkit_motor'] = 'from stemkit_motor import *';
  var value_output = Blockly.Python.valueToCode(block, 'speed', Blockly.Python.ORDER_ATOMIC);
  var dropdown_pin = block.getFieldValue('pin');
  var code = '';
  if (dropdown_pin == '1'){
    code = 'pin11.servo360_write('+ value_output + ')\n';
  }
  else{
    code = 'pin16.servo360_write('+ value_output + ')\n';
  }  
  return code;
};

Blockly.Blocks['stemkit_sound_playtrack'] = {
  init: function() {
    this.jsonInit(
      {
        type: "stemkit_sound_playtrack",
        message0: "%4 loa %2 phát bài %1 âm lượng %3",
        args0: [
          {
            type: "input_value",
            name: "track"
          },
          {
            "type": "field_dropdown",
            "name": "PORT",
            "options": [
              [
                "A",
                "A"
              ],
              [
                "B",
                "B"
              ]
            ]
          },
          {
            "type": "input_value",
            "name": "vol",
            "check": "Number"
          },
          {
            "type": "field_image",
            "src": "https://i.ibb.co/1mM59bs/sound.png",
            "width": 30,
            "height": 30,
            "alt": "*",
            "flipRtl": false
          }
        ],
        inputsInline: true,
        previousStatement: null,
        nextStatement: null,
        colour: ColorBlock,
        tooltip: "",
        helpUrl: ""
      }
    );
  }
};

Blockly.Python['stemkit_sound_playtrack'] = function(block) {
  var number_track = Blockly.Python.valueToCode(block, 'track', Blockly.Python.ORDER_ATOMIC);
  var dropdown_port = block.getFieldValue('PORT');
  var port;

  if (dropdown_port == 'A'){
    port = 'sound = machine.UART(1, baudrate=9600, rx=pin0.pin, tx=pin13.pin)\n';
  }
  else{
    port = 'sound = machine.UART(1, baudrate=9600, rx=pin1.pin, tx=pin14.pin)\n';
  }
  Blockly.Python.definitions_['import_yolobit'] = 'from yolobit import *';
  Blockly.Python.definitions_['import_sound_player'] = 'from stemkit_sound_player import *\n'+ port;
  var number_vol = Blockly.Python.valueToCode(block, 'vol', Blockly.Python.ORDER_ATOMIC);
  // TODO: Assemble Python into code variable.

  var code = 'sound.write(set_volume(' + number_vol + '))\n'+'sound.write(play_track(' + number_track + '))\n';
  return code;
};