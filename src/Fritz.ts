/**
 * smartFritz - Fritz goes smartHome
 *
 * AVM SmartHome nodeJS Control - for AVM Fritz!Box and Dect200 Devices
 *
 * @author Andreas Goetz <cpuidle@gmx.de>
 *
 * Forked from: https://github.com/nischelwitzer/smartfritz
 * nischi - first version: July 2014
 *
 * based on: Node2Fritz by steffen.timm on 05.12.13 for Fritz!OS > 05.50
 * and  thk4711 (code https://github.com/pimatic/pimatic/issues/38)
 *
 * AVM Documentation is at https://avm.de/service/schnittstellen/
 */

/*
 * Object-oriented API
 */

import axios from 'axios';
import crypto from 'crypto';
import parser from 'xml2json';
import * as qs from 'qs';
import {
  api2temp,
  AVMDevice,
  color2apihue,
  ColorName,
  colortemp2api,
  defaultUrl,
  FUNCTION_BUTTON,
  FUNCTION_COLORCONTROL,
  FUNCTION_LIGHT,
  FUNCTION_THERMOSTAT,
  IBase,
  IExt,
  IState,
  ITemp,
  level2api,
  OSInfo,
  ReqOption,
  satindex2apisat,
  state2api,
  temp2api,
  time2api,
} from './utils';

export default class Fritz {
  protected sid: string | null;

  protected username: string;

  protected password: string;

  protected url = defaultUrl;

  protected deviceList: AVMDevice[] | null;

  constructor(username: string, password: string, url?: string) {
    this.sid = null;
    this.username = username;
    this.password = password;
    this.deviceList = null;
    if (url) {
      this.url = url;
    }
  }

  async getSID(): Promise<string> {
    if (this.sid === null) {
      this.sid = await this.getSessionID(this.username, this.password);
    }
    if (this.sid === null) {
      throw new Error('Bad SID');
    }
    return this.sid;
  }

  /*
   * Functional API
   */

  private static async httpRequest<T>(
    request: string,
    options?: ReqOption
  ): Promise<T> {
    try {
      let res;
      if (options?.method === 'POST') {
        if (options.form) {
          const form = qs.stringify(options.form);

          res = await axios.post<any>(request, form, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          });
        } else {
          throw new Error('no form data');
        }
      } else {
        res = await axios.get<any>(request);
      }
      return res.data;
    } catch (e) {
      console.error(e);
      throw new Error('httpRequest Failed');
    }
  }

  /**
   * Execute Fritz API command for device specified by AIN
   */
  async executeCommand<T>(
    sid: boolean,
    command: string | null,
    ain: string | null,
    path?: string,
    ...param: string[]
  ) {
    const ePath = [];
    const eParam = [];
    ePath.push(this.url);
    if (path) {
      ePath.push(path);
    } else {
      ePath.push('/webservices/homeautoswitch.lua');
      eParam.push('0=0');
    }
    param.forEach((el) => {
      eParam.push(el);
    });

    if (sid) eParam.push(`sid=${await this.getSID()}`);
    if (command) eParam.push(`switchcmd=${command}`);
    if (ain) eParam.push(`ain=${ain}`);

    if (eParam.length > 0) {
      ePath.push('?');
      ePath.push(eParam.join('&'));
    }

    return Fritz.httpRequest<T>(ePath.join(''));
  }

  // #############################################################################

  /*
   * Session handling
   */

  // get session id
  private async getSessionID(
    username: string,
    password: string
  ): Promise<string> {
    let body = await this.executeCommand<any>(
      false,
      null,
      null,
      '/login_sid.lua'
    );

    const challenge = body.match('<Challenge>(.*?)</Challenge>')[1];
    const challengeResponse = `${challenge}-${crypto
      .createHash('md5')
      .update(Buffer.from(`${challenge}-${password}`, 'utf16le'))
      .digest('hex')}`;
    const url = `/login_sid.lua?username=${username}&response=${challengeResponse}`;

    body = await this.executeCommand(false, null, null, url);

    const sessionID = body.match('<SID>(.*?)</SID>')[1];
    return sessionID;
  }

  // check if session id is OK
  async checkSession(): Promise<boolean> {
    const body = await this.executeCommand<string>(
      true,
      null,
      null,
      '/login_sid.lua'
    );
    const sessionID = body.match('<SID>(.*?)</SID>');
    return !!sessionID && sessionID[1] !== '0000000000000000';
  }

  /*
   * General functions
   */

  // get OS version
  async getOSVersion() {
    const req: ReqOption = {
      method: 'POST',
      form: {
        sid: await this.getSID(),
        xhr: 1,
        page: 'overview',
      },
    };
    const json = await Fritz.httpRequest<OSInfo>(`${this.url}/data.lua`, req);
    const osVersion =
      json.data && json.data.fritzos && json.data.fritzos.nspver
        ? json.data.fritzos.nspver
        : null;
    return osVersion;
  }

  // get template information (XML)
  async getTemplateListInfos(): Promise<string> {
    return this.executeCommand<string>(true, 'gettemplatelistinfos', null);
  }

  // get template information (json)
  getTemplateList: IBase<any[]> = async () => {
    const templateinfo = await this.getTemplateListInfos();

    const templates = JSON.parse(parser.toJson(templateinfo));

    // extract templates as array
    let out: any[] = [];
    out = out.concat((templates.templatelist || {}).template || []);
    out = out.map((template) => {
      return template;
    });
    return out;
  };

  // apply template
  async applyTemplate(ain: string) {
    return this.executeCommand(true, 'applytemplate', ain);
  }

  // get basic device info (XML)

  async getBasicDeviceStats(ain: string) {
    return this.executeCommand(true, 'getbasicdevicestats', ain);
  }

  // get detailed device information (XML)

  async getDeviceListInfos() {
    return this.executeCommand<string>(true, 'getdevicelistinfos', null);
  }

  // get device list
  async getDeviceList(): Promise<AVMDevice[]> {
    const devicelistinfo = await this.getDeviceListInfos();
    const devicesCore = JSON.parse(parser.toJson(devicelistinfo));
    // extract devices as array
    let devices: AVMDevice[] = [];
    devices = devices.concat((devicesCore.devicelist || {}).device || []);
    devices = devices.map((dev: any) => {
      const newElement = dev;
      newElement.identifier = newElement.identifier.replace(/\s/g, '');
      return newElement;
    });
    return devices;
  }

  // get device list by filter criteria
  async getDeviceListFiltered(filter: any): Promise<AVMDevice[]> {
    /* jshint laxbreak:true */

    if (!this.deviceList) {
      this.deviceList = await this.getDeviceList();
    }

    return this.deviceList.filter((device: any) => {
      return Object.keys(filter).every(function (key) {
        /* jshint laxbreak:true */
        return key === 'functionbitmask'
          ? device.functionbitmask & filter[key]
          : device[key] === filter[key];
      });
    });
  }

  // get single device
  async getDevice(ain: string): Promise<AVMDevice | null> {
    const devices = await this.getDeviceListFiltered({
      identifier: ain,
    });
    return devices.length ? devices[0] : null;
  }

  // get temperature- both switches and thermostats are supported, but not powerline modules
  async getTemperature(ain: string): Promise<number> {
    const body = await this.executeCommand<string>(true, 'gettemperature', ain);
    return parseFloat(body) / 10; // °C
  }

  // get presence from deviceListInfo
  async getPresence(ain: string): Promise<boolean> {
    return !!(await this.getDevice(ain))?.presence;
  }

  /*
   * Switches
   */

  // get switch list
  async getSwitchList(): Promise<any[]> {
    let res = await this.executeCommand<string>(true, 'getswitchlist', null);
    res = res.replace('\n', '');
    return res === '' ? [] : res.split(',');
  }

  // get switch state
  getSwitchState: IExt<boolean> = async (ain) => {
    const body = await this.executeCommand<string>(true, 'getswitchstate', ain);
    return /^1/.test(body); // true if on
  };

  // turn an outlet on. returns the state the outlet was set to
  setSwitchOn: IExt<boolean> = async (ain) => {
    const body = await this.executeCommand<string>(true, 'setswitchon', ain);
    return /^1/.test(body); // true if on
  };

  // turn an outlet off. returns the state the outlet was set to
  setSwitchOff: IExt<boolean> = async (ain) => {
    const body = await this.executeCommand<string>(true, 'setswitchoff', ain);
    return /^1/.test(body); // false if off
  };

  // toggle an outlet. returns the state the outlet was set to
  setSwitchToggle: IExt<boolean> = async (ain) => {
    const body = await this.executeCommand<string>(
      true,
      'setswitchtoggle',
      ain
    );
    return /^1/.test(body); // false if off
  };

  // get the total enery consumption. returns the value in Wh
  getSwitchEnergy: IExt<number> = async (ain) => {
    const body = await this.executeCommand<string>(
      true,
      'getswitchenergy',
      ain
    );
    return parseFloat(body); // Wh
  };

  // get the current enery consumption of an outlet. returns the value in mW
  getSwitchPower: IExt<number | null> = async (ain) => {
    const body = await this.executeCommand<string>(true, 'getswitchpower', ain);
    const power = parseFloat(body);
    return Number.isNaN(power) ? null : power / 1000; // W
  };

  // get the outet presence status
  getSwitchPresence: IExt<boolean> = async (ain) => {
    const body = await this.executeCommand<string>(
      true,
      'getswitchpresent',
      ain
    );
    return /^1/.test(body); // true if present
  };

  // get switch name
  getSwitchName: IExt<string> = async (ain) => {
    const body = await this.executeCommand<string>(true, 'getswitchname', ain);
    return body.trim();
  };

  /*
   * Thermostats
   */

  // get the thermostat list
  getThermostatList: IBase<any> = async () => {
    const devices = await this.getDeviceListFiltered({
      functionbitmask: FUNCTION_THERMOSTAT,
    });
    return devices.map((device) => {
      return device.identifier;
    });
  };

  // set target temperature (Solltemperatur)
  async setTempTarget(ain: string, temp: number): Promise<number> {
    await this.executeCommand(true, `sethkrtsoll&param=${temp2api(temp)}`, ain);
    return temp;
  }

  // get target temperature (Solltemperatur)
  getTempTarget: IExt<ITemp> = async (ain) => {
    const body = await this.executeCommand<string>(true, 'gethkrtsoll', ain);
    return api2temp(body);
  };

  // get night temperature (Absenktemperatur)
  getTempNight: IExt<ITemp> = async (ain) => {
    const body = await this.executeCommand<string>(true, 'gethkrabsenk', ain);
    return api2temp(body);
  };

  // get comfort temperature (Komforttemperatur)
  getTempComfort: IExt<ITemp> = async (ain) => {
    const body = await this.executeCommand<string>(true, 'gethkrkomfort', ain);
    return api2temp(body);
  };

  // ------------------------------------------------
  // Not yet tested - deactivated for now
  //
  // activate boost with end time or deactivate boost
  async setHkrBoost(ain: string, endtime: number) {
    await this.executeCommand(
      true,
      `sethkrboost&endtimestamp=${time2api(endtime)}`,
      ain
    );
    return endtime;
  }

  // activate window open  with end time or deactivate boost
  async setHkrWindowOpen(ain: string, endtime: number) {
    await this.executeCommand(
      true,
      `sethkrwindowopen&endtimestamp=${time2api(endtime)}`,
      ain
    );
  }

  // activate window open  with end time or deactivate boost
  async setHkrOffset(deviceId: string, offset: number) {
    const path = '/net/home_auto_hkr_edit.lua';

    const req: ReqOption = {
      method: 'POST',
      form: {
        sid: await this.getSID(),
        xhr: 1,
        lang: 'de',
        no_sidrenew: '',
        ule_device_name: '',
        useajax: 1,
        WindowOpenTimer: '',
        WindowOpenTrigger: '',
        tempsensor: '',
        Roomtemp: '',
        ExtTempsensorID: '',
        Offset: offset,
        back_to_page: 'sh_dev',
        view: '',
        graphState: 1,
        apply: '',
        device: deviceId,
        oldpage: '/net/home_auto_hkr_edit.lua',
      },
    };

    await Fritz.httpRequest(path, req);
    return offset;
  }
  // ------------------------------------------------

  /*
   * AVM Buttons Fritz!DECT 400 and Fritz!DECT 440
   * Querying a button isn't really useful because they don't have a state to query,
   * there is just a timestamp of the last short and long button press.
   * The only useful information is the battery status returned in the 'battery' and
   * 'batterylow' property.
   * The Fritz!DECT 440 should have an additional 'temperature' property
   */

  // get a list of all button devices
  getButtonList: IBase<string[]> = async () => {
    const devices = await this.getDeviceListFiltered({
      functionbitmask: FUNCTION_BUTTON,
    });
    return devices.map((device) => {
      return device.identifier;
    });
  };

  /*
   * Light bulbs (HAN-FUN)
   */

  // get a list of all bulbs
  getBulbList: IBase<string[]> = async () => {
    const devices = await this.getDeviceListFiltered({
      functionbitmask: FUNCTION_LIGHT,
    });
    return devices.map((device) => {
      return device.identifier;
    });
  };

  // get a list of bulbs which support colors
  getColorBulbList: IBase<string[]> = async () => {
    const devices = await this.getDeviceListFiltered({
      functionbitmask: FUNCTION_LIGHT || FUNCTION_COLORCONTROL,
    });
    return devices.map((device) => {
      return device.identifier;
    });
  };

  // switch the device on, of or toggle its current state
  async setSimpleOnOff(ain: string, state: IState) {
    // ain = ain.replace('-1','');
    await this.executeCommand(
      true,
      `setsimpleonoff&onoff=${state2api(state)}`,
      ain
    );
    return state;
  }

  // Dimm the device, allowed values are 0 - 255
  async setLevel(ain: string, level: number) {
    await this.executeCommand(
      true,
      `setlevel&level=${level2api(level, false)}`,
      ain
    );
    return level;
  }

  // Dimm the device, allowed values are 0 - 100
  async setLevelPercentage(ain: string, levelInPercent: number) {
    return this.executeCommand(
      true,
      `setlevelpercentage&level=${level2api(levelInPercent, true)}`,
      ain
    ).then(function (body) {
      // api does not return a value
      return levelInPercent;
    });
  }

  // Set the color and saturation of a color bulb
  // Valid color values are:
  // red, orange, yellow, lime, green, turquoise, cyan,
  // lightblue, blue, purple, magenta and pink
  // Valid satindex values are: 0, 1 or 2
  async setColor(
    ain: string,
    color: ColorName,
    satindex: number,
    duration: number
  ) {
    await this.executeCommand(
      true,
      `setcolor&hue=${color2apihue(color)}&saturation=${satindex2apisat(
        color,
        satindex
      )}&duration=${duration}`,
      ain
    );
    return color;
  }

  // Set the color temperature of a bulb.
  // Valid values are 2700, 3000, 3400,3800, 4200, 4700, 5300, 5900 and 6500.
  // Other values are adjusted to one of the above values
  async setColorTemperature(
    ain: string,
    temperature: number,
    duration: number
  ) {
    const temp = colortemp2api(temperature);
    await this.executeCommand(
      true,
      `setcolortemperature&temperature=${temp}&duration=${duration}`,
      ain
    );
    return temp;
  }

  // get the color defaults
  // This is mostly useless because they are no defaults which can be changed but
  // fixed values. Only combinations returned by this api call are accepted by
  // setcolor and setcolortemperature.
  // module.exports.getColorDefaults = function(sid, ain, options)
  // {
  //     return executeCommand(true, 'getcolordefaults', ain, options).then(function(body) {
  //         return body;
  //     });
  // };

  // ------------------------------------------------
  // Not yet tested - deactivated for now
  // I don't know about any blind control unit with HANFUN support, but this API call makes
  // it plausible that AVM or a partner has somthing like that in the pipeline.
  //
  async setBlind(ain: string, blindState: string | number) {
    // „open“, „close“ or „stop“
    await this.executeCommand(true, `setblind&target=${blindState}`, ain);
    return blindState;
  }

  // get battery charge
  // Attention: this function queries the whole device list to get the value for one device.
  // If multiple device will be queried for the battery status, a better approach would be to
  // get the device list once and then filter out the devices of interest.
  getBatteryCharge: IExt<unknown | null> = async (ain) => {
    const device = await this.getDevice(ain);
    return device?.battery;
  };

  // Get the window open flag of a thermostat
  // Attention: this function queries the whole device list to get the value for one device.
  // If multiple device will be queried for the window open status, a better approach would
  // be to get the device list once and then filter out the devices of interest.
  getWindowOpen: IExt<boolean> = async (ain) => {
    const device = await this.getDevice(ain);
    return device?.hkr?.windowopenactiv === '1';
  };

  /*
   * WLAN
   */

  // Parse guest WLAN form settings
  parseGuestWlanHTML(html: string) {
    throw new Error('Not Implemented');
    /*
    $ = cheerio.load(html);
    const form = $('form');
    const settings = {};

    $('input', form).each(function (i, elem) {
      let val;
      const name = $(elem).attr('name');
      if (!name) return;

      switch ($(elem).attr('type')) {
        case 'checkbox':
          val = $(elem).attr('checked') == 'checked';
          break;
        default:
          val = $(elem).val();
      }
      settings[name] = val;
    });

    $('select option[selected=selected]', form).each(function (i, elem) {
      const val = $(elem).val();
      const name = $(elem).parent().attr('name');
      settings[name] = val;
    });

    return settings; */
  }

  // get guest WLAN settings - not part of Fritz API
  async getGuestWlan(): Promise<any> {
    const body = await this.executeCommand<string>(
      true,
      null,
      null,
      '/wlan/guest_access.lua?0=0'
    );
    return this.parseGuestWlanHTML(body);
  }

  // set guest WLAN settings - not part of Fritz API
  async setGuestWlan(enable: boolean) {
    throw new Error('Not Implemented');

    /*  /!* jshint laxbreak:true *!/
      const settings =
        enable ||
        executeCommand(
          sid,
          undefined,
          undefined,
          options,
          '/wlan/guest_access.lua?0=0'
        ).then(function (body) {
          return extend(parseGuestWlanHTML(body), {
            activate_guest_access: enable,
          });
        });

      return settings.then(function (settings) {
        // convert boolean to checkbox
        for (const property in settings) {
          if (settings[property] === true) settings[property] = 'on';
          else if (settings[property] === false) delete settings[property];
        }

        const req = {
          method: 'POST',
          form: extend(settings, {
            sid,
            xhr: 1,
            no_sidrenew: '',
            apply: '',
            oldpage: '/wlan/guest_access.lua',
          }),
        };

        return httpRequest('/data.lua', req, options).then(function (body) {
          return parseGuestWlanHTML(body);
        });
      }); */
  }

  async getPhoneList() {
    return this.executeCommand(
      true,
      null,
      null,
      '/fon_num/foncalls_list.lua?csv='
    );
  }
}
