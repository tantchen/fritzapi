// functions bitmask
import { HueColor } from './lib';

/**
 *  HAN-FUN device
 */
const FUNCTION_HANFUN = 1;
/**
 *   Bulb
 */
const FUNCTION_LIGHT = 1 << 2;
/**
 *   Alarm Sensor
 */
const FUNCTION_ALARM = 1 << 4;
/**
 *   Button device
 */
const FUNCTION_BUTTON = 1 << 5;
/**
 *   Comet DECT, Heizkostenregler
 */
const FUNCTION_THERMOSTAT = 1 << 6;
/**
 *   Energie Messgerät
 */
const FUNCTION_ENERGYMETER = 1 << 7;
/**
 *   Temperatursensor
 */
const FUNCTION_TEMPERATURESENSOR = 1 << 8;
/**
 *   Schaltsteckdose
 */
const FUNCTION_OUTLET = 1 << 9;
/**
 *   AVM DECT Repeater
 */
const FUNCTION_DECTREPEATER = 1 << 10;
/**
 *   Microphone
 */
const FUNCTION_MICROFONE = 1 << 11;
/**
 *   Template
 */
const FUNCTION_TEMPLATE = 1 << 12;
/**
 *   HAN-FUN unit
 */
const FUNCTION_HANFUNUNIT = 1 << 13;
/**
 *   Simple switch on/off
 */
const FUNCTION_SWITCHCONTROL = 1 << 15;
/**
 *   level
 */
const FUNCTION_LEVELCONTROL = 1 << 16;
/**
 *   color
 */
const FUNCTION_COLORCONTROL = 1 << 17;

export {
  FUNCTION_HANFUN,
  FUNCTION_LIGHT,
  FUNCTION_ALARM,
  FUNCTION_BUTTON,
  FUNCTION_THERMOSTAT,
  FUNCTION_ENERGYMETER,
  FUNCTION_TEMPERATURESENSOR,
  FUNCTION_OUTLET,
  FUNCTION_DECTREPEATER,
  FUNCTION_MICROFONE,
  FUNCTION_TEMPLATE,
  FUNCTION_HANFUNUNIT,
  FUNCTION_SWITCHCONTROL,
  FUNCTION_LEVELCONTROL,
  FUNCTION_COLORCONTROL,
};
/**
 * colormap
 */
type ColorName =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'lime'
  | 'green'
  | 'turquoise'
  | 'cyan'
  | 'lightblue'
  | 'blue'
  | 'purple'
  | 'magenta'
  | 'pink';

const colors = new Map<ColorName, HueColor>([
  ['red', { hue: 358, sat: [180, 112, 54], val: [255, 255, 255] }],
  ['orange', { hue: 35, sat: [214, 140, 72], val: [252, 252, 255] }],
  ['yellow', { hue: 52, sat: [153, 102, 51], val: [255, 255, 255] }],
  ['lime', { hue: 92, sat: [123, 79, 38], val: [248, 250, 252] }],
  ['green', { hue: 120, sat: [160, 82, 38], val: [220, 232, 242] }],
  ['turquoise', { hue: 160, sat: [145, 84, 41], val: [235, 242, 248] }],
  ['cyan', { hue: 195, sat: [179, 118, 59], val: [255, 255, 255] }],
  ['lightblue', { hue: 212, sat: [169, 110, 56], val: [252, 252, 255] }],
  ['blue', { hue: 225, sat: [204, 135, 67], val: [255, 255, 255] }],
  ['purple', { hue: 266, sat: [169, 110, 54], val: [250, 250, 252] }],
  ['magenta', { hue: 296, sat: [140, 92, 46], val: [250, 252, 255] }],
  ['pink', { hue: 335, sat: [180, 107, 51], val: [255, 248, 250] }],
]);

export { colors, ColorName };

const MIN_TEMP = 8;
const MAX_TEMP = 28;

export { MIN_TEMP, MAX_TEMP };

const defaultUrl = 'http://fritz.box';

export { defaultUrl };
