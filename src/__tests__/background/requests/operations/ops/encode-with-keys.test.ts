import { encodeWithKeys } from '@background/requests/operations/ops/encode-with-keys';
import * as MemoEncode from '@hiveio/hive-js/lib/auth/memo';

describe('encodeWithKeys', () => {
  beforeEach(() => {
    jest.spyOn(chrome.i18n, 'getMessage').mockImplementation((k) => String(k));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('encodes the message for each public key using the request key', async () => {
    const encodeSpy = jest
      .spyOn(MemoEncode, 'encode')
      .mockReturnValueOnce('enc-a')
      .mockReturnValueOnce('enc-b');

    const requestHandler = {
      data: { key: 'privWif' },
    } as any;

    const msg = await encodeWithKeys(requestHandler, {
      publicKeys: ['STM111', 'STM222'],
      message: 'secret',
      request_id: 99,
    } as any);

    expect(encodeSpy).toHaveBeenNthCalledWith(1, 'privWif', 'STM111', 'secret');
    expect(encodeSpy).toHaveBeenNthCalledWith(2, 'privWif', 'STM222', 'secret');
    expect(msg.msg?.success).toBe(true);
    expect(msg.msg?.result).toEqual({
      STM111: 'enc-a',
      STM222: 'enc-b',
    });
  });

  it('returns createMessage with error when encode throws', async () => {
    jest.spyOn(MemoEncode, 'encode').mockImplementation(() => {
      throw new Error('bad_memo');
    });

    const requestHandler = { data: { key: 'k' } } as any;

    const msg = await encodeWithKeys(requestHandler, {
      publicKeys: ['STMx'],
      message: 'm',
      request_id: 1,
    } as any);

    expect(msg.msg?.success).toBe(false);
    expect(msg.msg?.error).toEqual(expect.any(Error));
  });
});
