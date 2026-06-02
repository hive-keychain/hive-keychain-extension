import AccountSelectorOrderUtils from '@popup/multichain/utils/account-selector-order.utils';
import EncryptUtils from '@popup/hive/utils/encrypt.utils';
import { AccountSelectorOrderRef } from '@interfaces/account-selector-order.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const createEvmAccount = (
  id: number,
  order: number,
  hide = false,
  seedId = 1,
) => ({
  id,
  path: `m/44'/60'/0'/0/${id}`,
  seedId,
  seedNickname: 'Main seed',
  nickname: `EVM ${id}`,
  order,
  wallet: { address: `0x${String(id).padStart(40, '0')}` },
  source: 'seed' as const,
  hide,
});

describe('account-selector-order.utils', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('areEvmOrderRefsEqual compares only evm refs in order', () => {
    const left: AccountSelectorOrderRef[] = [
      { type: 'hive', name: 'alice' },
      { type: 'evm', seedId: 1, accountId: 0 },
      { type: 'evm', seedId: 1, accountId: 1 },
    ];
    const rightWithHiveMoved: AccountSelectorOrderRef[] = [
      { type: 'hive', name: 'bob' },
      { type: 'evm', seedId: 1, accountId: 0 },
      { type: 'evm', seedId: 1, accountId: 1 },
    ];
    const rightWithEvmMoved: AccountSelectorOrderRef[] = [
      { type: 'hive', name: 'alice' },
      { type: 'evm', seedId: 1, accountId: 1 },
      { type: 'evm', seedId: 1, accountId: 0 },
    ];

    expect(
      AccountSelectorOrderUtils.areEvmOrderRefsEqual(left, rightWithHiveMoved),
    ).toBe(true);
    expect(
      AccountSelectorOrderUtils.areEvmOrderRefsEqual(left, rightWithEvmMoved),
    ).toBe(false);
  });

  it('buildDefaultDisplayOrder places hive accounts before visible evm accounts', () => {
    const hive = [accounts.local.justTwoKeys];
    const evmVisible = [
      createEvmAccount(1, 2),
      createEvmAccount(0, 1),
    ];

    expect(
      AccountSelectorOrderUtils.buildDefaultDisplayOrder(hive, evmVisible),
    ).toEqual([
      { type: 'hive', name: accounts.local.justTwoKeys.name },
      { type: 'evm', seedId: 1, accountId: 0 },
      { type: 'evm', seedId: 1, accountId: 1 },
    ]);
  });

  it('mergeDisplayOrder drops removed accounts and appends new ones', () => {
    const saved: AccountSelectorOrderRef[] = [
      { type: 'hive', name: 'removed-hive' },
      { type: 'hive', name: accounts.local.justTwoKeys.name },
      { type: 'evm', seedId: 1, accountId: 99 },
    ];
    const hive = [accounts.local.justTwoKeys, { name: 'new-hive', keys: {} }];
    const evmVisible = [createEvmAccount(2, 0)];

    expect(
      AccountSelectorOrderUtils.mergeDisplayOrder(saved, hive, evmVisible),
    ).toEqual([
      { type: 'hive', name: accounts.local.justTwoKeys.name },
      { type: 'hive', name: 'new-hive' },
      { type: 'evm', seedId: 1, accountId: 2 },
    ]);
  });

  it('saveDisplayOrder encrypts refs and getDecryptedDisplayOrder round-trips', async () => {
    const refs: AccountSelectorOrderRef[] = [
      { type: 'hive', name: accounts.local.justTwoKeys.name },
      { type: 'evm', seedId: 1, accountId: 0 },
    ];
    const saveSpy = jest.spyOn(LocalStorageUtils, 'saveValueInLocalStorage');

    await AccountSelectorOrderUtils.saveDisplayOrder(mk.user.one, refs);

    const savedPayload = saveSpy.mock.calls[0][1];
    expect(saveSpy).toHaveBeenCalledWith(
      LocalStorageKeyEnum.ACCOUNT_SELECTOR_DISPLAY_ORDER,
      expect.any(String),
    );
    expect(savedPayload).not.toContain(accounts.local.justTwoKeys.name);

    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue(savedPayload);

    await expect(
      AccountSelectorOrderUtils.getDecryptedDisplayOrder(mk.user.one),
    ).resolves.toEqual(refs);
  });

  it('re-encrypts plaintext legacy display order payloads on read', async () => {
    const refs: AccountSelectorOrderRef[] = [
      { type: 'hive', name: accounts.local.justTwoKeys.name },
    ];
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue({ list: refs });
    const saveSpy = jest.spyOn(LocalStorageUtils, 'saveValueInLocalStorage');

    await expect(
      AccountSelectorOrderUtils.getDecryptedDisplayOrder(mk.user.one),
    ).resolves.toEqual(refs);
    expect(saveSpy).toHaveBeenCalledWith(
      LocalStorageKeyEnum.ACCOUNT_SELECTOR_DISPLAY_ORDER,
      expect.any(String),
    );
  });

  it('syncDisplayOrderWithAccounts appends a new hive account at the end', async () => {
    const existing: AccountSelectorOrderRef[] = [
      { type: 'evm', seedId: 1, accountId: 0 },
      { type: 'hive', name: accounts.local.justTwoKeys.name },
    ];
    const encrypted = await EncryptUtils.encryptJson(
      { list: existing },
      mk.user.one,
    );
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue(encrypted);
    const saveSpy = jest.spyOn(LocalStorageUtils, 'saveValueInLocalStorage');

    const hive = [
      accounts.local.justTwoKeys,
      { name: 'new-hive', keys: {} },
    ];

    await AccountSelectorOrderUtils.syncDisplayOrderWithAccounts(
      mk.user.one,
      hive,
      [],
    );

    const savedPayload = saveSpy.mock.calls[0][1];
    const decrypted = await EncryptUtils.decryptToJson(savedPayload, mk.user.one);
    expect(decrypted.list).toEqual([
      { type: 'hive', name: accounts.local.justTwoKeys.name },
      { type: 'hive', name: 'new-hive' },
    ]);
  });
});
