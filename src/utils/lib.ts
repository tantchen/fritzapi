export type ITemp = number | 'on' | 'off';
export type IBase<T> = () => Promise<T>;
export type IExt<T> = (ain: string) => Promise<T>;

export type ReqOption = 'GET' | 'POST';

export interface HueColor {
  hue: number;
  sat: number[];
  val: number[];
}

export interface AVMDevice {
  functionbitmask: number;
  identifier: string;
  presence?: unknown;
  hkr?: any;
  battery?: unknown;
}
