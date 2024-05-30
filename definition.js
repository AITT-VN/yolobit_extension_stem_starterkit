const StemKitColorBlock = '#44cbc6';
const ImgUrl = 'https://ohstem-public.s3.ap-southeast-1.amazonaws.com/extensions/AITT-VN/yolobit_extension_stem_starterkit/images/';
const ImgUrl2 = 'https://ohstem-public.s3.ap-southeast-1.amazonaws.com/extensions/AITT-VN/yolobit_extension_rover/images/';

Blockly.Blocks["stemkit_led_tiny"] = {
  init: function () {
    this.jsonInit({
      inputsInline: true,
      colour: StemKitColorBlock,
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
          "src": ImgUrl + 'tiny-rgb.png',
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
  Blockly.Python.definitions_['import_led_tiny_init'] = 'tiny_rgb = RGBLed(' + port + '.pin, 4)';
  // TODO: Assemble Python into code variable.
  var code = "tiny_rgb.show(" + option + ", hex_to_rgb(" + color + "))\n";
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
        "colour": StemKitColorBlock,
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
        "colour": StemKitColorBlock,
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
        "colour": StemKitColorBlock,
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

Blockly.Blocks['stemkit_mini_pump'] = {
  /**
   * Block for waiting.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit(
      {
        "type": "stemkit_mini_pump",
        "message0": "%3 máy bơm %1 bật %2 %%",
        "args0": [
          {
            "type": "field_dropdown",
            "name": "NAME",
            "options": [
              [
                "M1",
                "0"
              ],
              [
                "M2",
                "1"
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
        "colour": StemKitColorBlock,
        "tooltip": "",
        "helpUrl": ""
      }
    );
  }
};

Blockly.Python['stemkit_mini_pump'] = function(block) {
  Blockly.Python.definitions_['import_stemkit_motor'] = 'from stemkit_motor import *';
  var dropdown_name = block.getFieldValue('NAME');
  var value_percent = Blockly.Python.valueToCode(block, 'percent', Blockly.Python.ORDER_ATOMIC);
  
  // TODO: Assemble Python into code variable.
  if (dropdown_name == "0") {
    return "motor.set_speed(" + value_percent + ")\n";  
  } else {
    return "motor.set_speed(None, " + value_percent + ")\n";  
  }
};

Blockly.Blocks['stemkit_move_motor'] = {
  init: function () {
    this.jsonInit(
      {
        "type": "stemkit_move_motor",
        "message0": "%3 M1 %1 M2 %2 (-100:100)",
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
        "colour": StemKitColorBlock,
      }
    );
  }
};

Blockly.Python["stemkit_move_motor"] = function (block) {
  Blockly.Python.definitions_['import_stemkit_motor'] = 'from stemkit_motor import *';
  var left_wheel_speed = Blockly.Python.valueToCode(block, 'left_wheel_speed', Blockly.Python.ORDER_ATOMIC);
  var right_wheel_speed = Blockly.Python.valueToCode(block, 'right_wheel_speed', Blockly.Python.ORDER_ATOMIC);
  // TODO: Assemble Python into code variable.
  var code = "motor.set_speed(" + left_wheel_speed + ", " + right_wheel_speed + ")\n";
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
      "colour": StemKitColorBlock,
    });
  }
};

Blockly.Python["motor_stop"] = function (block) {
  Blockly.Python.definitions_['import_stemkit_motor'] = 'from stemkit_motor import *';
  // TODO: Assemble Python into code variable.
  var code = "motor.stop()\n";
  return code;
};

Blockly.Blocks["servo_write_angle"] = {
  init: function () {
    this.jsonInit({
      colour: StemKitColorBlock,
      nextStatement: null,
      message0: "%3 xoay servo %2 góc %1 (0:180)",
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
  Blockly.Python.definitions_['import_yolobit'] = 'from yolobit import *';
  var value_output = Blockly.Python.valueToCode(block, 'angle', Blockly.Python.ORDER_ATOMIC);
  var dropdown_pin = block.getFieldValue('pin');
  var code = '';
  if (dropdown_pin == '1'){
    code = 'pin6.servo_write('+ value_output + ')\n';
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
        "message0": "%3 quay servo 360 %1 tốc độ %2 (-100:100)",
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
        colour: StemKitColorBlock
      }
    );
  }
};

Blockly.Python['servo360_write'] = function (block) {
  Blockly.Python.definitions_['import_yolobit'] = 'from yolobit import *';
  var value_output = Blockly.Python.valueToCode(block, 'speed', Blockly.Python.ORDER_ATOMIC);
  var dropdown_pin = block.getFieldValue('pin');
  var code = '';
  if (dropdown_pin == '1'){
    code = 'pin6.servo360_write('+ value_output + ')\n';
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
        colour: StemKitColorBlock,
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

// MPR121 blocks

// nếu có phím được nhấn
Blockly.Blocks["stemkit_mpr121_scan"] = {
  init: function() {
    this.jsonInit({
      "message0": '%1keypad có phím đang nhấn',
      "args0":[
        {
          "type": "field_image",
          "src": ImgUrl + 'keypad.png',
          "width": 30,
          "height": 30,
          "alt": "*",
          "flipRtl": false
        }
      ],
      "output": null,
      "colour": StemKitColorBlock,
      "tooltip": "",
      "helpUrl": ""
    });
  }
};

Blockly.Python["stemkit_mpr121_scan"] = function(block) {
  Blockly.Python.definitions_["import_stemkit_mpr121"] = "from stemkit_mpr121 import touchpad\ntouchpad.reset()";
  // TODO: Assemble Python into code variable.
  var code ="touchpad.scan() != -1";
  return [code, Blockly.Python.ORDER_NONE];
};


// nếu đọc phím dg nhấn = #
Blockly.Blocks['stemkit_mpr121_check'] = {
  init: function() {
    this.jsonInit(
      {
        "type": "stemkit_mpr121_check",
        "message0": '%2keypad phím %1 được nhấn',
        "args0": [
          {
            "type": "field_dropdown",
            "name": "KEY",
            "options": [
              [
                "0",
                "0"
              ],
              [
                "1",
                "1"
              ],
              [
                "2",
                "2"
              ],
              [
                "3",
                "3"
              ],
              [
                "4",
                "4"
              ],
              [
                "5",
                "5"
              ],
              [
                "6",
                "6"
              ],
              [
                "7",
                "7"
              ],
              [
                "8",
                "8"
              ],
              [
                "9",
                "9"
              ],
              [
                "*",
                "10"
              ],
              [
                "#",
                "11"
              ]
            ]
          },
          {
            "type": "field_image",
            "src": ImgUrl + 'keypad.png',
            "width": 30,
            "height": 30,
            "alt": "*",
            "flipRtl": false
          }
        ],
        "output": "Boolean",
        "colour": StemKitColorBlock,
        "tooltip": "",
        "helpUrl": ""
      }
    );
  }
};

Blockly.Python['stemkit_mpr121_check'] = function(block) {
  Blockly.Python.definitions_["import_stemkit_mpr121"] = "from stemkit_mpr121 import touchpad\ntouchpad.reset()";
  // TODO: Assemble Python into code variable.
  var key = block.getFieldValue('KEY');
  var code = 'touchpad.scan() == ' + key;
  return [code, Blockly.Python.ORDER_NONE];
};

// đọc hết chữ đã nhấn = abc

Blockly.Blocks["stemkit_mpr121_read"] = {
  init: function() {
    this.jsonInit({
      "message0": '%2keypad các chữ đã nhấn = %1 %3',
      "args0": [
        { type: "input_value", name: "VALUE", check: "String" },
        {
          "type": "field_image",
          "src": ImgUrl + 'keypad.png',
          "width": 30,
          "height": 30,
          "alt": "*",
          "flipRtl": false
        },
        {
          "type": "input_dummy"
        }
        
      ],
      "output": null,
      "colour": StemKitColorBlock,
      "tooltip": "",
      "helpUrl": ""
    });
  }
};

Blockly.Python["stemkit_mpr121_read"] = function(block) {
  Blockly.Python.definitions_["import_stemkit_mpr121"] = "from stemkit_mpr121 import touchpad\ntouchpad.reset()";

  // TODO: Assemble Python into code variable.
  var value = Blockly.Python.valueToCode(block, 'VALUE', Blockly.Python.ORDER_ATOMIC);
  var code ="touchpad.read() == " + value;
  return [code, Blockly.Python.ORDER_NONE];
};

// xóa chữ đã nhấn

Blockly.Blocks['stemkit_mpr121_clear'] = {
  init: function () {
    this.jsonInit({
      "colour": StemKitColorBlock,
      nextStatement: null,
      tooltip: "keypad xóa các chữ đã nhấn",
      message0: "%1keypad xóa các chữ đã nhấn",
      previousStatement: null,
      args0: [
        {
          "type": "field_image",
          "src": ImgUrl + 'keypad.png',
          "width": 30,
          "height": 30,
          "alt": "*",
          "flipRtl": false
        }
      ],
      helpUrl: "",
    });
  },
};

Blockly.Python['stemkit_mpr121_clear'] = function(block) {
  Blockly.Python.definitions_["import_stemkit_mpr121"] = "from stemkit_mpr121 import touchpad\ntouchpad.reset()";
  // TODO: Assemble Python into code variable.
  var code ="touchpad.clear()\n";
  return code;
};

Blockly.Blocks['stemkit_mpr121_sound_off'] = {
  init: function () {
    this.jsonInit({
      "colour": StemKitColorBlock,
      nextStatement: null,
      tooltip: "keypad tắt âm thanh",
      message0: "%1keypad tắt âm thanh",
      previousStatement: null,
      args0: [
        {
          "type": "field_image",
          "src": ImgUrl + 'keypad.png',
          "width": 30,
          "height": 30,
          "alt": "*",
          "flipRtl": false
        }
      ],
      helpUrl: "",
    });
  },
};

Blockly.Python['stemkit_mpr121_sound_off'] = function(block) {
  Blockly.Python.definitions_["import_stemkit_mpr121"] = "from stemkit_mpr121 import touchpad\ntouchpad.reset()";
  // TODO: Assemble Python into code variable.
  var code ="touchpad.sound = False\n";
  return code;
};
//Gas sensor block

Blockly.Blocks["stemkit_gas_sensor"] = {
  init: function () {
    this.jsonInit({
      colour: StemKitColorBlock,
      tooltip: "",
      message0: "%2 nồng độ khí Gas %1",
      args0: [
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
          "src": "https://thumb.silhouette-ac.com/t/d3/d3b6690d14b7257b7cfe59a179a862a0_w.jpeg",
          "width": 30,
          "height": 30,
          "alt": "*",
          "flipRtl": false
        }
      ],
      output: "Number",
      helpUrl: "",
    });
  },
};

Blockly.Python["stemkit_gas_sensor"] = function (block) {
  var dropdown_port = block.getFieldValue('PORT');
  var mq_pin;

  if (dropdown_port == 'A'){
    mq_pin = 'mq = MQ(Pin(pin0.adc_pin)) # analog PIN';
  }
  else{
    mq_pin = 'mq = MQ(Pin(pin1.adc_pin)) # analog PIN';
  }
  Blockly.Python.definitions_['import_yolobit'] = 'from yolobit import *';
  Blockly.Python.definitions_['import_mq'] = 'from stemkit_mq import MQ';
  Blockly.Python.definitions_["import_create_mq"] = mq_pin;
  // TODO: Assemble Python into code variable.

  var code = 'mq.get_ppm()';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Blocks["stemkit_gas_detected"] = {
  init: function () {
    this.jsonInit({
      colour: StemKitColorBlock,
      tooltip: "",
      message0: "%2 %1 phát hiện khí Gas",
      args0: [
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
          "src": "https://thumb.silhouette-ac.com/t/d3/d3b6690d14b7257b7cfe59a179a862a0_w.jpeg",
          "width": 30,
          "height": 30,
          "alt": "*",
          "flipRtl": false
        }
      ],
      output: "Boolean",
      helpUrl: "",
    });
  },
};

Blockly.Python["stemkit_gas_detected"] = function (block) {
  var dropdown_port = block.getFieldValue('PORT');
  var mq_pin;

  if (dropdown_port == 'A'){
    mq_pin = 'mq = MQ(Pin(pin0.adc_pin)) # analog PIN';
  }
  else{
    mq_pin = 'mq = MQ(Pin(pin1.adc_pin)) # analog PIN';
  }
  Blockly.Python.definitions_['import_yolobit'] = 'from yolobit import *';
  Blockly.Python.definitions_['import_mq'] = 'from stemkit_mq import MQ';
  Blockly.Python.definitions_["import_create_mq"] = mq_pin;
  // TODO: Assemble Python into code variable.

  var code = 'mq.get_ppm() > 50';
  return [code, Blockly.Python.ORDER_NONE];
};


// Robot Move
Blockly.Blocks['robot_move'] = {
  init: function () {
    this.jsonInit(
      {
        "type": "robot_move",
        "message0": "%1 di chuyển %2 tốc độ %3",
        "args0": [
          {
            "type": "field_image",
            "src": ImgUrl2 + 'move.svg',
            "width": 20,
            "height": 20,
            "alt": "",
            "flipRtl": false
          },
          {
            "type": "field_dropdown",
            "name": "direction",
            "options": [
              [
                {
                  "src": ImgUrl2 + 'arrow-up.svg',
                  "width": 15,
                  "height": 15,
                  "alt": "*"
                },
                "forward"
              ],
              [
                {
                  "src": ImgUrl2 + 'arrow-down.svg',
                  "width": 15,
                  "height": 15,
                  "alt": "*"
                },
                "backward"
              ],
              [
                {
                  "src": ImgUrl2 + 'arrow-left.svg',
                  "width": 15,
                  "height": 15,
                  "alt": "*"
                },
                "turn_left"
              ],
              [
                {
                  "src": ImgUrl2 + 'arrow-right.svg',
                  "width": 15,
                  "height": 15,
                  "alt": "*"
                },
                "turn_right"
              ]
            ]
          },
          {
            min: 0,
            type: "input_value",
            check: "Number",
            value: 50,
            name: "speed",
          }
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": StemKitColorBlock,
        "tooltip": "",
        "helpUrl": ""
      }
    );
  }
};

Blockly.Python["robot_move"] = function (block) {
  Blockly.Python.definitions_['import_robot'] = 'from stemkit_motor import *';
  var dir = block.getFieldValue("direction");
  var speed = Blockly.Python.valueToCode(block, 'speed', Blockly.Python.ORDER_ATOMIC);
  // TODO: Assemble Python into code variable.
  var code = "motor." + dir + "(" + speed + ")\n";
  return code;
};

Blockly.Blocks['robot_move_delay'] = {
  init: function () {
    this.jsonInit(
      {
        "type": "robot_move_delay",
        "message0": "%1 di chuyển %2 tốc độ %3 trong %4 giây",
        "args0": [
          {
            "type": "field_image",
            "src": ImgUrl2 + 'move.svg',
            "width": 20,
            "height": 20,
            "alt": "",
            "flipRtl": false
          },
          {
            "type": "field_dropdown",
            "name": "direction",
            "options": [
              [
                {
                  "src": ImgUrl2 + 'arrow-up.svg',
                  "width": 15,
                  "height": 15,
                  "alt": "*"
                },
                "forward"
              ],
              [
                {
                  "src": ImgUrl2 + 'arrow-down.svg',
                  "width": 15,
                  "height": 15,
                  "alt": "*"
                },
                "backward"
              ],
              [
                {
                  "src": ImgUrl2 + 'arrow-left.svg',
                  "width": 15,
                  "height": 15,
                  "alt": "*"
                },
                "turn_left"
              ],
              [
                {
                  "src": ImgUrl2 + 'arrow-right.svg',
                  "width": 15,
                  "height": 15,
                  "alt": "*"
                },
                "turn_right"
              ]
            ]
          },
          {
            min: 0,
            type: "input_value",
            check: "Number",
            value: 50,
            name: "speed",
          },
          {
            min: 0,
            type: "input_value",
            check: "Number",
            name: "time",
          }
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": StemKitColorBlock,
        "tooltip": "",
        "helpUrl": ""
      }
    );
  }
};

Blockly.Python["robot_move_delay"] = function (block) {
  Blockly.Python.definitions_['import_robot'] = 'from stemkit_motor import *';
  var dir = block.getFieldValue("direction");
  var speed = Blockly.Python.valueToCode(block, 'speed', Blockly.Python.ORDER_ATOMIC);
  var time = Blockly.Python.valueToCode(block, 'time', Blockly.Python.ORDER_ATOMIC);
  // TODO: Assemble Python into code variable.
  var code = "motor." + dir + "(" + speed + ", " + time + ")\n";
  return code;
};

Blockly.Blocks['robot_move_motor'] = {
  init: function () {
    this.jsonInit(
      {
        "type": "robot_move_motor",
        "message0": "%3 M1 %1 M2 %2 (-100:100)",
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
            "src": ImgUrl2 + 'motor.svg',
            "width": 20,
            "height": 20,
            "alt": "*",
            "flipRtl": false
          }
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": StemKitColorBlock,
        "tooltip": "",
        "helpUrl": ""
      }
    );
  }
};

Blockly.Python["robot_move_motor"] = function (block) {
  Blockly.Python.definitions_['import_robot'] = 'from stemkit_motor import *';
  var left_wheel_speed = Blockly.Python.valueToCode(block, 'left_wheel_speed', Blockly.Python.ORDER_ATOMIC);
  var right_wheel_speed = Blockly.Python.valueToCode(block, 'right_wheel_speed', Blockly.Python.ORDER_ATOMIC);
  // TODO: Assemble Python into code variable.
  var code = "motor.set_wheel_speed(" + left_wheel_speed + ", " + right_wheel_speed + ")\n";
  return code;
};

Blockly.Blocks['robot_stop'] = {
  init: function () {
    this.jsonInit({
      "type": "robot_stop",
      "message0": "%1 dừng di chuyển",
      "args0": [
        {
          "type": "field_image",
          "src":  ImgUrl2 + 'stop.svg',
          "width": 20,
          "height": 20,
          "alt": "*",
          "flipRtl": false
        }],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": StemKitColorBlock,
      "tooltip": "",
      "helpUrl": ""
    });
  }
};

Blockly.Python["robot_stop"] = function (block) {
  Blockly.Python.definitions_['import_robot'] = 'from stemkit_motor import *';
  // TODO: Assemble Python into code variable.
  var code = "motor.stop()\n";
  return code;
};


// Line Array
Blockly.Blocks['robot_line_sensor_read_all'] = {
  init: function () {
    this.jsonInit(
      {
        "type": "robot_line_sensor_read_all",
        "message0": "%1 cảm biến line phát hiện S1 %2 S2 %3 S3 %4 S4 %5",
        "args0": [
          {
            "type": "field_image",
            "src": ImgUrl2 + 'line.svg',
            "width": 15,
            "height": 15,
            "alt": "*",
            "flipRtl": false
          },
          {
            "type": "field_dropdown",
            "name": "S1",
            "options": [
              [
                {
                  "src": ImgUrl2 + 'line_finder_none_detect.png',
                  "width": 15,
                  "height": 15,
                  "alt": "none"
                },
                "0"
              ],
              [
                {
                  "src": ImgUrl2 + 'line_finder_detect.png',
                  "width": 15,
                  "height": 15,
                  "alt": "detect"
                },
                "1"
              ]
            ]
          },
          {
            "type": "field_dropdown",
            "name": "S2",
            "options": [
              [
                {
                  "src": ImgUrl2 + 'line_finder_none_detect.png',
                  "width": 15,
                  "height": 15,
                  "alt": "none"
                },
                "0"
              ],
              [
                {
                  "src": ImgUrl2 + 'line_finder_detect.png',
                  "width": 15,
                  "height": 15,
                  "alt": "detect"
                },
                "1"
              ]
            ]
          },
          {
            "type": "field_dropdown",
            "name": "S3",
            "options": [
              [
                {
                  "src": ImgUrl2 + 'line_finder_none_detect.png',
                  "width": 15,
                  "height": 15,
                  "alt": "none"
                },
                "0"
              ],
              [
                {
                  "src": ImgUrl2 + 'line_finder_detect.png',
                  "width": 15,
                  "height": 15,
                  "alt": "detect"
                },
                "1"
              ]
            ]
          },
          {
            "type": "field_dropdown",
            "name": "S4",
            "options": [
              [
                {
                  "src": ImgUrl2 + 'line_finder_none_detect.png',
                  "width": 15,
                  "height": 15,
                  "alt": "none"
                },
                "0"
              ],
              [
                {
                  "src": ImgUrl2 + 'line_finder_detect.png',
                  "width": 15,
                  "height": 15,
                  "alt": "detect"
                },
                "1"
              ]
            ]
          }
        ],
        "colour": StemKitColorBlock,
        "output": "Boolean",
        "tooltip": "",
        "helpUrl": ""
      }
    );
  }
};

Blockly.Python["robot_line_sensor_read_all"] = function (block) {
  Blockly.Python.definitions_['import_robot'] = 'from stemkit_motor import *';
  var S1 = block.getFieldValue("S1");
  var S2 = block.getFieldValue("S2");
  var S3 = block.getFieldValue("S3");
  var S4 = block.getFieldValue("S4");
  // TODO: Assemble Python into code variable.
  var code = "motor.read_line_sensors() == (" + S1 + ", " + S2 + ", " + S3 + ", " + S4 + ")";
  return [code, Blockly.Python.ORDER_NONE];
};


Blockly.Blocks['robot_line_sensor_read_single'] = {
  init: function () {
    this.jsonInit(
      {
        "type": "robot_line_sensor_read_single",
        "message0": "%1 cảm biến line đọc giá trị %2",
        "args0": [
          {
            "type": "field_image",
            "src": ImgUrl2 + 'line.svg',
            "width": 15,
            "height": 15,
            "alt": "*",
            "flipRtl": false
          },
          {
            "type": "field_dropdown",
            "name": "pin",
            "options": [
              ["S1", "1"],
              ["S2", "2"],
              ["S3", "3"],
              ["S4", "4"],
            ],
          },
        ],
        "colour": StemKitColorBlock,
        "output": "",
        "tooltip": "",
        "helpUrl": ""
      }
    );
  }
};

Blockly.Python["robot_line_sensor_read_single"] = function (block) {
  Blockly.Python.definitions_['import_robot'] = 'from stemkit_motor import *';
  var pin = block.getFieldValue("pin");
  // TODO: Assemble Python into code variable.
  var code = "motor.read_line_sensors(" + pin + ")";
  return [code, Blockly.Python.ORDER_NONE];
};


//Robocon

Blockly.Blocks['stemkit_robocon_follow_line_until_cross'] = {
  init: function () {
    this.jsonInit(
      {
        "type": "stemkit_robocon_follow_line_until_cross",
        "message0": "%3 dò line tốc độ %1 gặp vạch ngang rồi %2",
        "args0": [
          {
            type: "input_value",
            check: "Number",
            value: 50,
            name: "speed",
          },
          {
            type: "field_dropdown",
            name: "stop",
            options: [
            ["dừng và khóa", "BRAKE"],
            ["không làm gì", "None"],
            ]
          },
          {
            "type": "field_image",
            "src": ImgUrl2 + 'line.svg',
            "width": 15,
            "height": 15,
            "alt": "*",
            "flipRtl": false
          }
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": StemKitColorBlock,
        "tooltip": "",
        "helpUrl": ""
      }
    );
  }
};

Blockly.Python["stemkit_robocon_follow_line_until_cross"] = function (block) {
  Blockly.Python.definitions_['import_robot'] = 'from stemkit_motor import *';
  Blockly.Python.definitions_['import_robocon'] = 'from stemkit_robocon import *';
  var speed = Blockly.Python.valueToCode(block, 'speed', Blockly.Python.ORDER_ATOMIC);
  var stop = block.getFieldValue('stop');
  // TODO: Assemble Python into code variable.
  var code = "follow_line_until_cross(" + speed + ", 15000, " + stop + ")\n";
  return code;
};

Blockly.Blocks['stemkit_robocon_follow_line_until_end'] = {
  init: function () {
    this.jsonInit(
      {
        "type": "stemkit_robocon_follow_line_until_end",
        "message0": "%3 dò line tốc độ %1 đến cuối vạch đen rồi %2",
        "args0": [
          {
            type: "input_value",
            check: "Number",
            value: 50,
            name: "speed",
          },
          {
            type: "field_dropdown",
            name: "stop",
            options: [
            ["dừng và khóa", "BRAKE"],
            ["không làm gì", "None"],
            ]
          },
          {
            "type": "field_image",
            "src": ImgUrl2 + 'line.svg',
            "width": 15,
            "height": 15,
            "alt": "*",
            "flipRtl": false
          }
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": StemKitColorBlock,
        "tooltip": "",
        "helpUrl": ""
      }
    );
  }
};

Blockly.Python["stemkit_robocon_follow_line_until_end"] = function (block) {
  Blockly.Python.definitions_['import_robot'] = 'from stemkit_motor import *';
  Blockly.Python.definitions_['import_robocon'] = 'from stemkit_robocon import *';
  var speed = Blockly.Python.valueToCode(block, 'speed', Blockly.Python.ORDER_ATOMIC);
  var stop = block.getFieldValue('stop');
  // TODO: Assemble Python into code variable.
  var code = "follow_line_until_end(" + speed + ", 15000, " + stop + ")\n";
  return code;
};

Blockly.Blocks['stemkit_robocon_turn_until_line_detected_then'] = {
  init: function () {
    this.jsonInit(
      {
        "type": "stemkit_robocon_turn_until_line_detected_then",
        "message0": "%4 quay %1 tốc độ %2 gặp vạch đen rồi %3",
        "args0": [
          {
            "type": "field_dropdown",
            "name": "direction",
            "options": [
              [
                {
                  "src": "static/blocks/block_images/860774.svg",
                  "width": 15,
                  "height": 15,
                  "alt": "*"
                },
                "left"
              ],
              [
                {
                  "src": "static/blocks/block_images/74474.svg",
                  "width": 15,
                  "height": 15,
                  "alt": "*"
                },
                "right"
              ]
            ]
          },
          {
            "type": "input_value",
            "name": "speed",
            "check": "Number",
          },
          {
            type: "field_dropdown",
            name: "stop",
            options: [
            ["dừng và khóa", "BRAKE"],
            ["không làm gì", "None"],
            ]
          },
          {
            "type": "field_image",
            "src": ImgUrl2 + 'line.svg',
            "width": 15,
            "height": 15,
            "alt": "*",
            "flipRtl": false
          }
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": StemKitColorBlock,
        "tooltip": "",
        "helpUrl": ""
      }
    );
  }
};

Blockly.Python["stemkit_robocon_turn_until_line_detected_then"] = function (block) {
  Blockly.Python.definitions_['import_robot'] = 'from stemkit_motor import *';
  Blockly.Python.definitions_['import_robocon'] = 'from stemkit_robocon import *';
  var dir = block.getFieldValue('direction');
  var speed = Blockly.Python.valueToCode(block, 'speed', Blockly.Python.ORDER_ATOMIC);
  var stop = block.getFieldValue('stop');
  // TODO: Assemble Python into code variable.
  var code = "";
  if (dir == "left") {
    code = "turn_until_line_detected(" + -speed + ", " + speed + ", 5000, " + stop + ")\n";
  } else {
    code = "turn_until_line_detected(" + speed + ", " + -speed + ", 5000, " + stop + ")\n";
  }
  return code;
};

Blockly.Blocks['stemkit_robocon_follow_line_until'] = {
  init: function () {
    this.jsonInit(
      {
        "type": "stemkit_robocon_follow_line_until",
        "message0": "%4 dò line tốc độ %1 đến khi %2 tối đa %3 giây",
        "args0": [
          {
            type: "input_value",
            check: "Number",
            value: 50,
            name: "speed",
          },
          {
            "type": "input_value",
            "name": "condition",
          },
          {
            type: "input_value",
            check: "Number",
            name: "timeout",
          },
          {
            "type": "field_image",
            "src": ImgUrl2 + 'line.svg',
            "width": 15,
            "height": 15,
            "alt": "*",
            "flipRtl": false
          }
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": StemKitColorBlock,
        "tooltip": "",
        "helpUrl": ""
      }
    );
  }
};
Blockly.Python["stemkit_robocon_follow_line_until"] = function (block) {
  Blockly.Python.definitions_['import_robot'] = 'from stemkit_motor import *';
  Blockly.Python.definitions_['import_robocon'] = 'from stemkit_robocon import *';
  var speed = Blockly.Python.valueToCode(block, 'speed', Blockly.Python.ORDER_ATOMIC);
  var condition = Blockly.Python.valueToCode(block, 'condition', Blockly.Python.ORDER_ATOMIC);
  var timeout = Blockly.Python.valueToCode(block, 'timeout', Blockly.Python.ORDER_ATOMIC);
  // TODO: Assemble Python into code variable.
  var code = "follow_line_until(" + speed + ", " + "lambda: (" + condition + "), " + timeout * 1000 + ")\n";
  return code;
};

Blockly.Blocks['stemkit_robocon_follow_line_delay'] = {
  init: function () {
    this.jsonInit(
      {
        "type": "stemkit_robocon_follow_line_delay",
        "message0": "%3 dò line tốc độ %1 (0-100) trong %2 giây",
        "args0": [

          {
            min: 0,
            type: "input_value",
            check: "Number",
            value: 50,
            name: "speed",
          },
          {
            min: 0,
            type: "input_value",
            check: "Number",
            name: "timeout",
          },
          {
            "type": "field_image",
            "src": ImgUrl2 + 'line.svg',
            "width": 15,
            "height": 15,
            "alt": "*",
            "flipRtl": false
          }
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": StemKitColorBlock,
        "tooltip": "",
        "helpUrl": ""
      }
    );
  }
};

Blockly.Python["stemkit_robocon_follow_line_delay"] = function (block) {
  Blockly.Python.definitions_['import_robot'] = 'from stemkit_motor import *';
  Blockly.Python.definitions_['import_robocon'] = 'from stemkit_robocon import *';
  var speed = Blockly.Python.valueToCode(block, 'speed', Blockly.Python.ORDER_ATOMIC);
  var timeout = Blockly.Python.valueToCode(block, 'timeout', Blockly.Python.ORDER_ATOMIC);
  // TODO: Assemble Python into code variable.
  var code = "follow_line_until(" + speed + ", " + "lambda: (False), " + timeout * 1000 + ")\n";
  return code;
};


// REMOTE CONTROL BLOCK

Blockly.Blocks['stemkit_remote_control_init'] = {
  init: function () {
    this.jsonInit(
      {
        type: "stemkit_remote_control_init",
        message0: "bật chế độ điều khiển bằng gamepad",
        previousStatement: null,
        nextStatement: null,
        args0: [
        ],
        colour: StemKitColorBlock,
        tooltip: "",
        helpUrl: ""
      }
    )
  },
};

Blockly.Python['stemkit_remote_control_init'] = function (block) {
  Blockly.Python.definitions_['import_stemkit_remotecontrol'] = 'from stemkit_remotecontrol import *';
  // TODO: Assemble Python into code variable.
  var code = "";
  return code;
};

Blockly.Blocks['stemkit_remote_control_processing'] = {
  init: function () {
    this.jsonInit(
      {
        type: "stemkit_remote_control_processing",
        message0: "xử lý lệnh từ gamepad",
        previousStatement: null,
        nextStatement: null,
        args0: [
        ],
        colour: StemKitColorBlock,
        tooltip: "",
        helpUrl: ""
      }
    )
  },
};

Blockly.Python['stemkit_remote_control_processing'] = function (block) {
  Blockly.Python.definitions_['import_stemkit_remote_control'] = 'from stemkit_remotecontrol import *';
  // TODO: Assemble Python into code variable.
  var code = "stemkit_rc_mode.run()\n";
  return code;
};

Blockly.Blocks["stemkit_remote_control_on_button_pressed"] = {
  init: function () {
    this.jsonInit({
      colour: StemKitColorBlock,
      message0: "nếu nút %1 được nhấn%2%3",
      tooltip: "",
      args0: [
        {
          type: "field_dropdown",
          name: "BUTTON",
          options: [
            ['A', 'A'],
            ['B', 'B'],
            ['C', 'C'],
            ['D', 'D']
          ],
        },
        {
          type: "input_dummy",
        },
        {
          type: "input_statement",
          name: "ACTION",
        },
      ],
      helpUrl: "",
    });
  },
};

Blockly.Python['stemkit_remote_control_on_button_pressed'] = function (block) {
  Blockly.Python.definitions_['import_stemkit_remote_control'] = 'from stemkit_remotecontrol import *';
  var button = block.getFieldValue('BUTTON');
  var statements_action = Blockly.Python.statementToCode(block, 'ACTION');

  var globals = buildGlobalString(block);

  var cbFunctionName = Blockly.Python.provideFunction_(
    'on_gamepad_button_' + button,
    (globals != '') ?
      ['def ' + Blockly.Python.FUNCTION_NAME_PLACEHOLDER_ + '():',
        globals,
      statements_action || Blockly.Python.PASS
      ] :
      ['def ' + Blockly.Python.FUNCTION_NAME_PLACEHOLDER_ + '():',
      statements_action || Blockly.Python.PASS
      ]);

  var code = 'stemkit_rc_mode.set_command(BTN_' + button + ', ' + cbFunctionName + ')\n';
  Blockly.Python.definitions_['on_gamepad_button_callback' + button] = code;

  return '';
};