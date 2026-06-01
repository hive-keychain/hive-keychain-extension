import AccountModule from '@background/account';
import MkModule from '@background/mk.module';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import { EvmAccountSource } from 'src/popup/evm/interfaces/wallet.interface';
import EncryptUtils from 'src/popup/hive/utils/encrypt.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

describe('account tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it('Must return undefined', async () => {
    const sGetMk = jest.spyOn(MkModule, 'getMk').mockResolvedValue(undefined);
    await AccountModule.sendBackImportedAccounts('');
    expect(sGetMk).not.toHaveBeenCalled();
  });

  it('Must call sendMessage with error', async () => {
    jest.spyOn(MkModule, 'getMk').mockResolvedValue(mk.user.one);
    const sSendMessage = jest
      .spyOn(chrome.runtime, 'sendMessage')
      .mockResolvedValue(undefined);
    await AccountModule.sendBackImportedAccounts('Wrong_FileContent0000');
    expect(sSendMessage).toHaveBeenCalledWith({
      command: BackgroundCommand.SEND_BACK_IMPORTED_ACCOUNTS,
      value: { success: false, message: 'import_html_error' },
    });
  });

  it('Must import and save accounts', async () => {
    jest
      .spyOn(MkModule, 'getMk')
      .mockResolvedValue(accounts.encrypted.noHash.oneAccount.mkUsed);
    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue(null);
    const sSendMessage = jest
      .spyOn(chrome.runtime, 'sendMessage')
      .mockResolvedValue(undefined);
    await AccountModule.sendBackImportedAccounts(
      accounts.encrypted.noHash.oneAccount.msg,
    );
    expect(sSendMessage).toHaveBeenCalledWith({
      command: BackgroundCommand.SEND_BACK_IMPORTED_ACCOUNTS,
      value: expect.objectContaining({
        success: true,
        message: 'import_html_success',
        accounts: expect.arrayContaining([
          expect.objectContaining({
            name: accounts.encrypted.noHash.oneAccount.original.list[0].name,
          }),
        ]),
        warning: null,
      }),
    });
  });

  it('Must import v2 multichain accounts', async () => {
    jest.spyOn(MkModule, 'getMk').mockResolvedValue(mk.user.one);
    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue(undefined);
    const saveSpy = jest.spyOn(LocalStorageUtils, 'saveValueInLocalStorage');
    const sSendMessage = jest
      .spyOn(chrome.runtime, 'sendMessage')
      .mockResolvedValue(undefined);
    const multichainPayload = await EncryptUtils.encryptJson(
      {
        v: 2,
        hiveAccounts: [accounts.local.one],
        evmAccounts: [
          {
            type: EvmAccountSource.IMPORTED,
            nickname: 'Imported',
            id: 1,
            accounts: [
              {
                id: 0,
                address: '0x1234567890123456789012345678901234567890',
                privateKey:
                  '0x1234567890123456789012345678901234567890123456789012345678901234',
                path: '',
                order: 0,
                nickname: 'Main',
              },
            ],
          },
        ],
      },
      mk.user.one,
    );

    await AccountModule.sendBackImportedAccounts(multichainPayload);

    expect(saveSpy).toHaveBeenCalledWith(
      LocalStorageKeyEnum.ACCOUNTS,
      expect.any(String),
    );
    expect(saveSpy).toHaveBeenCalledWith(
      LocalStorageKeyEnum.EVM_ACCOUNTS,
      expect.any(String),
    );
    expect(sSendMessage).toHaveBeenCalledWith({
      command: BackgroundCommand.SEND_BACK_IMPORTED_ACCOUNTS,
      value: expect.objectContaining({
        success: true,
        message: 'import_html_success',
        accountType: 'all',
      }),
    });
  });

  it('Must reject malformed v2 payloads', async () => {
    jest.spyOn(MkModule, 'getMk').mockResolvedValue(mk.user.one);
    const malformedV2 = await EncryptUtils.encryptJson(
      {
        v: 2,
        hiveAccounts: 'invalid',
        evmAccounts: [],
      },
      mk.user.one,
    );
    const sSendMessage = jest
      .spyOn(chrome.runtime, 'sendMessage')
      .mockResolvedValue(undefined);

    await AccountModule.sendBackImportedAccounts(malformedV2);

    expect(sSendMessage).toHaveBeenCalledWith({
      command: BackgroundCommand.SEND_BACK_IMPORTED_ACCOUNTS,
      value: { success: false, message: 'import_html_error' },
    });
  });
});
