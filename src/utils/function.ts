import { ColorName, colors, MAX_TEMP, MIN_TEMP } from './const';
import { IState, ITemp } from './lib';

/**
 * Check if numeric value
 */
function isNumeric(n: any) {
  return !Number.isNaN(parseFloat(n)) && Number.isFinite(n);
}
/*
 * Temperature conversion
 */

function temp2api(temp: unknown) {
  let res;

  if (temp === 'on' || temp === true) res = 254;
  else if (temp === 'off' || temp === false) res = 253;
  else if (typeof temp === 'number') {
    // 0.5C accuracy
    res =
      Math.round((Math.min(Math.max(temp, MIN_TEMP), MAX_TEMP) - 8) * 2) + 16;
  } else {
    throw new Error('Invalid Type');
  }

  return res;
}

function api2temp(param: string | number): ITemp {
  if (param === 254) return 'on';
  if (param === 253) return 'off';

  if (typeof param === 'number') {
    throw new Error('Invalid Argument');
  }

  // 0.5C accuracy
  return (parseFloat(param) - 16) / 2 + 8;
}

function time2api(seconds: number) {
  if (seconds <= 0) {
    return 0;
  }

  return Date.now() / 1000 + Math.min(60 * 60 * 24, seconds);
}

// function api2time(param)
// {
//     // convert the input to a readable timestamp
//     return 0;
// }

function state2api(param: IState): number {
  // convert the input to an allowed value
  if (typeof param === 'number') {
    return param;
  }
  switch (param) {
    case 'off':
      return 0;
    case 'on':
      return 1;
    case 'toggle':
    default:
      return 2;
  }
}

function level2api(param: number, isPercent: boolean) {
  // convert the input to an allowed value
  if (isPercent) return param > 100 ? 100 : param;
  return param > 255 ? 255 : param;
  return 0;
}

// The fritzbox accepts only a predefined set of color temperatures
// Setting the color temperature to other values fails silently.
function colortemp2api(param: number) {
  if (param > 6200) return 6500;
  if (param > 5600) return 5900;
  if (param > 5000) return 5300;
  if (param > 4500) return 4700;
  if (param > 4000) return 4200;
  if (param > 3600) return 3800;
  if (param > 3200) return 3400;
  if (param > 2850) return 3000;
  return 2700;
}

// Fritz color schemes
// The fritzbox accepts only a limited range of hue/saturation combinations
// to set the color of a bulb. The hue value must be one of the 12 predefined
// values for the base colors and each of the hue values has its own set of
// three saturation values.
// Any attempt to use other hue/saturaion values fails silently.

function color2apihue(color: ColorName) {
  const col = colors.get(color);
  if (col !== undefined)
    // convert the input to an allowed value
    return col.hue;
  return 0;
}

function satindex2apisat(color: ColorName, satindex: number) {
  const col = colors.get(color);
  if (col !== undefined)
    // convert the input to an allowed value
    return col.sat[satindex > 2 ? 0 : satindex];
  return 0;
}

export {
  isNumeric,
  temp2api,
  api2temp,
  time2api,
  state2api,
  level2api,
  colortemp2api,
  color2apihue,
  satindex2apisat,
};
