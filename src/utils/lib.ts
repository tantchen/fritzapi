export type ITemp = number | 'on' | 'off';
export type IState = 0 | 1 | 2 | 'on' | 'off' | 'toggle';
export type IBase<T> = () => Promise<T>;
export type IExt<T> = (ain: string) => Promise<T>;

export interface ReqOption {
  method: 'POST' | 'GET';
  form: any;
}

export interface HueColor {
  hue: number;
  sat: number[];
  val: number[];
}

// eslint-disable-next-line @typescript-eslint/ban-types
type BadString = string | {};

export function isAVMSwitch(device: AVMDevice): device is AVMDeviceSwitch {
  const d: any = device;
  return d.button !== undefined && d.battery !== undefined;
}
export interface AVMDeviceSwitch extends AVMDevice {
  battery: string;
  batterylow: string;
  temperature: { celsius: string; offset: string };
  humidity?: { rel_humidity: string };
  button: {
    identifier: string;
    id: string;
    name: string;
    lastpressedtimestamp: BadString;
  }[];
}
export function isAVMBulb(device: AVMDevice): device is AVMDeviceBulb {
  const d: any = device;
  return d.simpleonoff !== undefined && d.levelcontrol !== undefined;
}
export interface AVMDeviceBulb extends AVMDevice {
  simpleonoff: { state: '0' | '1' };
  levelcontrol: { level: string; levelpercentage: string };
  colorcontrol: {
    supported_modes: string;
    current_mode: string;
    fullcolorsupport: string;
    mapped: string;
    hue: BadString;
    saturation: BadString;
    unmapped_hue: BadString;
    unmapped_saturation: BadString;
    temperature: BadString;
  };
  etsiunitinfo: {
    etsideviceid: string;
    unittype: string;
    interfaces: string;
  };
}
export interface AVMDeviceOpt {
  fwversion?: string;
  manufacturer?: string;
  productname?: string;
  id: string;
  name: string;
  present: string;
  txbusy: string;
}

export interface AVMDevice extends AVMDeviceOpt {
  functionbitmask: string;
  identifier: string;
  presence?: unknown;
  hkr?: any;
  battery?: unknown;
}

export interface Hide {
  ipv6: boolean;
  liveTv: boolean;
  faxSet: boolean;
  dectRdio: boolean;
  dectMoniEx: boolean;
  rss: boolean;
  mobile: boolean;
  dectMail: boolean;
  shareUsb: boolean;
  ssoSet: boolean;
  liveImg: boolean;
}

export interface Fritzos {
  Productname: string;
  NoPwd: boolean;
  ShowDefaults: boolean;
  expert_mode: string;
  fb_name: string;
  nspver: string;
  isLabor: boolean;
  twofactor_disabled: boolean;
  FirmwareSigned: boolean;
  showUpdate: boolean;
  isUpdateAvail: boolean;
  energy: string;
  boxDate: string;
}

export interface Docsis {
  txt: string;
  led: string;
  title: string;
  up: string;
  down: string;
  link: string;
}

export interface Call {
  number: string;
  link: string;
  date: string;
  duration: string;
  addible: boolean;
  classes: string;
  name: string;
  display: string;
  fonname: string;
  unknown: boolean;
  time: string;
}

export interface Foncalls {
  calls: Call[];
  callsToday: string;
  count_all: number;
  activecalls: string;
  count_today: number;
}

export interface Vpn {
  elements: any[];
  title: string;
  link: string;
}

export interface Internet {
  txt: string[];
  led: string;
  title: string;
  up: string;
  link2: string;
  down: string;
  link: string;
}

export interface Func {
  linktxt: string;
  details: string;
  link: string;
}

export interface Comfort {
  func: Func[];
  anyComfort: boolean;
}

export interface Changelog {
  deviceName: string;
  fritzOsVersion: string;
  connectionStatus: boolean;
  productName: string;
  iframeUrl: string;
}

export interface Tamcalls {
  calls: string;
  tam_configured: boolean;
  count: number;
  callsToday: string;
}

export interface Lan {
  txt: string;
  led: string;
  title: string;
  link: string;
}

export interface Usb {
  txt: string;
  led: string;
  title: string;
  link: string;
}

export interface Fonnum {
  txt: string;
  led: string;
  title: string;
  link: string;
}

export interface Device {
  classes: string;
  type: string;
  name: string;
  url: string;
  realtimeprio: boolean;
}

export interface Net {
  anyUnmeshedDevices: boolean;
  count: number;
  more_link: string;
  active_count: number;
  devices: Device[];
  otherAVMUpdates: number;
}

export interface Dect {
  txt: string;
  led: string;
  title: string;
  link: string;
}

export interface Wlan {
  txt: string;
  led: string;
  title: string;
  link: string;
  tooltip: string;
}

export interface Data {
  naslink: string;
  fritzos: Fritzos;
  webdav: string;
  MANUAL_URL: string;
  docsis: Docsis;
  language: string;
  AVM_URL: string;
  usbconnect: string;
  foncalls: Foncalls;
  vpn: Vpn;
  internet: Internet;
  SERVICEPORTAL_URL: string;
  comfort: Comfort;
  changelog: Changelog;
  tamcalls: Tamcalls;
  lan: Lan;
  usb: Usb;
  fonnum: Fonnum;
  NEWSLETTER_URL: string;
  net: Net;
  dect: Dect;
  wlan: Wlan;
}

export interface OSInfo {
  pid: string;
  hide: Hide;
  time: any[];
  data: Data;
  sid: string;
}
