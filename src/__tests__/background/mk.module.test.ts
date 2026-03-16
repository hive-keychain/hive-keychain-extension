import MkModule from '@background/mk.module';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { VaultKey } from '@reference-data/vault-message-key.enum';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import EncryptUtils from 'src/popup/hive/utils/encrypt.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import VaultUtils from 'src/utils/vault.utils';

describe('mk.module tests:\n', () => {
  const accountPayload = {
    list: [
      {
        name: 'alice',
        keys: {
          posting: 'posting-key',
          postingPubkey: 'STM123',
        },
      },
    ],
  };

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it('Must get Mk', async () => {
    jest.spyOn(VaultUtils, 'getValueFromVault').mockResolvedValue(mk.user.one);

    expect(await MkModule.getMk()).toBe(mk.user.one);
  });

  it('Must return true when valid login', async () => {
    const encryptedAccounts = await EncryptUtils.encryptJson(
      accountPayload,
      mk.user.one,
    );

    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue(encryptedAccounts);
    jest
      .spyOn(LocalStorageUtils, 'getMultipleValueFromLocalStorage')
      .mockResolvedValue({});

    expect(await MkModule.login(mk.user.one)).toBe(true);
  });

  it('Must return false when invalid login', async () => {
    const encryptedAccounts = await EncryptUtils.encryptJson(
      accountPayload,
      mk.user.one,
    );

    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue(encryptedAccounts);
    jest
      .spyOn(LocalStorageUtils, 'getMultipleValueFromLocalStorage')
      .mockResolvedValue({});

    expect(await MkModule.login('not_the_one')).toBe(false);
  });

  it('Must return true when valid login relies on v2 keyless storage', async () => {
    const keylessPayload = await EncryptUtils.encryptJson(
      {
        list: {
          alice: [{ appName: 'peakd.com', authKey: 'auth-key' }],
        },
      },
      mk.user.one,
    );

    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockImplementation((key: LocalStorageKeyEnum) => {
        switch (key) {
          case LocalStorageKeyEnum.ACCOUNTS:
            return undefined;
          case LocalStorageKeyEnum.KEYLESS_KEYCHAIN_AUTH_DATA_USER_DICT:
            return keylessPayload;
          default:
            return undefined;
        }
      });
    jest
      .spyOn(LocalStorageUtils, 'getMultipleValueFromLocalStorage')
      .mockResolvedValue({
        [LocalStorageKeyEnum.KEYLESS_KEYCHAIN_ENABLED]: true,
        [LocalStorageKeyEnum.KEYLESS_KEYCHAIN_AUTH_DATA_USER_DICT]: keylessPayload,
      });

    expect(await MkModule.login(mk.user.one)).toBe(true);
  });

  it('Must call sendMessage', async () => {
    jest.spyOn(VaultUtils, 'getValueFromVault').mockResolvedValue(mk.user.one);

    const sSendMessage = jest.spyOn(chrome.runtime, 'sendMessage');
    await MkModule.sendBackMk();
    expect(sSendMessage).toBeCalledWith({
      command: BackgroundCommand.SEND_BACK_MK,
      value: mk.user.one,
    });
  });

  it('Must set new MK', () => {
    const sSave = jest
      .spyOn(VaultUtils, 'saveValueInVault')
      .mockResolvedValue(true);
    MkModule.saveMk(mk.user.two);
    expect(sSave).toBeCalledWith(VaultKey.__MK, mk.user.two);
  });

  it('Must remove mk', () => {
    const sRemove = jest
      .spyOn(VaultUtils, 'removeFromVault')
      .mockResolvedValue(true);
    MkModule.lock();
    expect(sRemove).toBeCalledWith(VaultKey.__MK);
  });
});
