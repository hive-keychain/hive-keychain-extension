import {
  EVM_TOKEN_METADATA_CACHE_TTL_MS,
  EvmTokenMetadataCacheUtils,
} from '@popup/evm/utils/evm-token-metadata-cache.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

describe('RPC token metadata cache', () => {
  const address = '0x00000000000000000000000000000000000000aa';
  const key = `${LocalStorageKeyEnum.EVM_RPC_TOKEN_METADATA}:0x1:${address}:decimals`;
  const now = 1_800_000_000_000;
  let storage: Record<string, unknown>;

  beforeEach(() => {
    storage = {};
    jest.spyOn(Date, 'now').mockReturnValue(now);
    jest.spyOn(Logger, 'warn').mockImplementation(() => undefined);
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation(async (storageKey) => storage[storageKey]);
    jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockImplementation(async (storageKey, value) => {
        storage[storageKey] = value;
      });
  });

  afterEach(() => jest.restoreAllMocks());

  it('reads persisted zero decimals with normalized chain and address keys', async () => {
    storage[key] = { value: 0, fetchedAt: now - 1000 };
    const fetchValue = jest.fn().mockResolvedValue(6);
    await expect(
      EvmTokenMetadataCacheUtils.getField(
        '1', address.toUpperCase(), 'decimals', fetchValue,
      ),
    ).resolves.toBe(0);
    expect(fetchValue).not.toHaveBeenCalled();
    expect(LocalStorageUtils.saveValueInLocalStorage).not.toHaveBeenCalled();
  });

  it.each([
    { value: 6, fetchedAt: now - EVM_TOKEN_METADATA_CACHE_TTL_MS },
    { value: 6, fetchedAt: now + 1000 },
    { value: 6, fetchedAt: NaN },
    { value: 6 },
    { value: -1, fetchedAt: now },
    { value: 256, fetchedAt: now },
    { value: 1.5, fetchedAt: now },
    { value: '6', fetchedAt: now },
    null,
  ])('refreshes expired or invalid entries: %j', async (entry) => {
    storage[key] = entry;
    const fetchValue = jest.fn().mockResolvedValue(8);
    await expect(
      EvmTokenMetadataCacheUtils.getField(
        '0x1', address, 'decimals', fetchValue,
      ),
    ).resolves.toBe(8);
    expect(fetchValue).toHaveBeenCalledTimes(1);
    expect(storage[key]).toEqual({ value: 8, fetchedAt: now });
  });

  it('keeps chains and addresses separate during concurrent writes', async () => {
    const otherAddress = '0x00000000000000000000000000000000000000bb';
    const results = await Promise.all([
      EvmTokenMetadataCacheUtils.getField(
        '0x1', address, 'decimals', async () => 6,
      ),
      EvmTokenMetadataCacheUtils.getField(
        '0x2', address, 'decimals', async () => 8,
      ),
      EvmTokenMetadataCacheUtils.getField(
        '0x1', otherAddress, 'decimals', async () => 18,
      ),
    ]);
    expect(results).toEqual([6, 8, 18]);
    expect(Object.keys(storage)).toHaveLength(3);
  });

  it('does not extend another field’s TTL when filling missing metadata', async () => {
    storage[key] = { value: 6, fetchedAt: now - 1000 };
    await EvmTokenMetadataCacheUtils.getField(
      '0x1', address, 'name', async () => 'Token',
    );
    expect(storage[key]).toEqual({ value: 6, fetchedAt: now - 1000 });
  });

  it('shares failures among concurrent callers and retries the next lookup', async () => {
    const fetchValue = jest
      .fn()
      .mockRejectedValueOnce(new Error('RPC failed'))
      .mockResolvedValue(6);
    const first = EvmTokenMetadataCacheUtils.getField(
      '0x1', address, 'decimals', fetchValue,
    );
    const second = EvmTokenMetadataCacheUtils.getField(
      '1', address, 'decimals', fetchValue,
    );
    await expect(first).rejects.toThrow('RPC failed');
    await expect(second).rejects.toThrow('RPC failed');
    expect(fetchValue).toHaveBeenCalledTimes(1);
    expect(storage).toEqual({});
    await expect(
      EvmTokenMetadataCacheUtils.getField(
        '0x1', address, 'decimals', fetchValue,
      ),
    ).resolves.toBe(6);
    expect(fetchValue).toHaveBeenCalledTimes(2);
  });

  it.each(['', '  '])('does not persist empty text: %j', async (value) => {
    await EvmTokenMetadataCacheUtils.getField(
      '0x1', address, 'name', async () => value,
    );
    expect(storage).toEqual({});
  });

  it('uses RPC if cache reading fails', async () => {
    jest
      .mocked(LocalStorageUtils.getValueFromLocalStorage)
      .mockRejectedValue(new Error('Storage failed'));
    await expect(
      EvmTokenMetadataCacheUtils.getField(
        '0x1', address, 'decimals', async () => 6,
      ),
    ).resolves.toBe(6);
    expect(Logger.warn).toHaveBeenCalled();
  });

  it('returns RPC metadata even if persistence fails', async () => {
    jest
      .mocked(LocalStorageUtils.saveValueInLocalStorage)
      .mockRejectedValue(new Error('Storage full'));
    await expect(
      EvmTokenMetadataCacheUtils.getField(
        '0x1', address, 'decimals', async () => 6,
      ),
    ).resolves.toBe(6);
    expect(Logger.warn).toHaveBeenCalled();
    expect(storage).toEqual({});
  });
});
