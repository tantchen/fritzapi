import { config } from 'dotenv';
import { Fritz } from '../src';

/**
 * Using .env file for test credentials
 */
config();

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
const timeOut = 1500;
const testTimeout = 30000;
const {
  T_USER,
  T_PW,
  T_SWITCH_COUNT,
  T_URL,
  T_DEVICE_COUNT,
  T_AIN,
  T_BULB_COUNT,
  T_TEMPLATE_COUNT,
} = process.env;

const client = new Fritz(T_USER!, T_PW!, T_URL!);

describe('FritzClient', () => {
  test(
    'can get sid',
    async () => {
      const sid = await client.getSID();
      console.log(sid);
      expect(sid).not.toBe('');
      expect(sid).not.toBe('0000000000000000');
    },
    testTimeout,
  );

  test(
    'can validate session',
    async () => {
      expect(await client.checkSession()).toBeTruthy();
    },
    testTimeout,
  );
  test(
    'can check os version',
    async () => {
      expect(await client.getOSVersion()).not.toBeNull();
    },
    testTimeout,
  );
  test(
    'get full fritz config',
    async () => {
      expect(await client.getDataSheet()).not.toBeNull();
    },
    testTimeout,
  );
});

describe('Template', () => {
  test(
    'print info',
    async () => {
      const info = await client.getTemplateListInfos();
      expect(info).not.toBeNull();
      expect(info).not.toBeUndefined();
    },
    testTimeout,
  );
  test(
    'list all',
    async () => {
      const info = await client.getTemplateList();
      expect(info.length).toBe(Number(T_TEMPLATE_COUNT));
    },
    testTimeout,
  );
});
describe('Device', () => {
  test(
    'can list all',
    async () => {
      const list = await client.getDeviceList();
      expect(list.length).toBe(Number(T_DEVICE_COUNT));
    },
    testTimeout,
  );
  test(
    'can use filter',
    async () => {
      const list = await client.getDeviceListFiltered({
        manufacturer: 'AVM',
      });
      expect(list.length).toBe(Number(T_DEVICE_COUNT));
    },
    testTimeout,
  );
  test(
    'can get details',
    async () => {
      const device = await client.getDevice(T_AIN!);
      expect(device).not.toBeNull();
    },
    testTimeout,
  );
});
describe('Switch', () => {
  test(
    'can list all',
    async () => {
      const list = await client.getSwitchList();
      expect(list.length).toBe(Number(T_SWITCH_COUNT));
    },
    testTimeout,
  );
});
describe('Bulb', () => {
  test(
    'can list all',
    async () => {
      const list = await client.getBulbList();
      expect(list.length).toBe(Number(T_BULB_COUNT));
    },
    testTimeout,
  );

  test(
    'turn on',
    async () => {
      const result = await client.setSimpleOnOff(T_AIN!, 'on');
      await sleep(timeOut);
      expect(result).toBe('on');
    },
    testTimeout,
  );

  test(
    'set color to red',
    async () => {
      const list = await client.setColor(T_AIN!, 'red', 1, 1);
      await sleep(timeOut);
      expect(list).toBe('red');
    },
    testTimeout,
  );

  test(
    'set color to blue',
    async () => {
      const list = await client.setColor(T_AIN!, 'blue', 1, 1);
      await sleep(timeOut);
      expect(list).toBe('blue');
    },
    testTimeout,
  );
  test(
    'turn off',
    async () => {
      const result = await client.setSimpleOnOff(T_AIN!, 'off');
      await sleep(timeOut);
      expect(result).toBe('off');
    },
    testTimeout,
  );
});
