import { config } from 'dotenv';
import Fritz from '../src/Fritz';

/**
 * Using .env file for test credentials
 */
config();

const { TUSER, TPW, TURL } = process.env;

const client = new Fritz(TUSER as string, TPW as string, TURL as string);

describe('Base Client', () => {
  test('can get sid', async () => {
    const sid = await client.getSID();
    console.log(sid);
    expect(sid).not.toBe('');
    expect(sid).not.toBe('0000000000000000');
  });

  test("",()=>{

  })
});
