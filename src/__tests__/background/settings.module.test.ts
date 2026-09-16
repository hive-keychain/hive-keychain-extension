import SettingsModule from '@background/settings.module';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import '@testing-library/jest-dom';
import settings from 'src/__tests__/utils-for-testing/data/settings';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { CustomDataFromLocalStorage } from 'src/__tests__/utils-for-testing/interfaces/mocks.interface';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

describe('settings.module tests:\n', () => {
  const noConfirm = {
    'keychain.tests': {
      'splinterlands.com': {
        signBuffer: true,
        signTx: true,
      },
    },
  };

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it('Must return error if saving fails', async () => {
    const sSendMessage = jest.spyOn(chrome.runtime, 'sendMessage');
    LocalStorageUtils.saveValueInLocalStorage = jest
      .fn()
      .mockRejectedValue('Not possible to save!');
    await SettingsModule.sendBackImportedFileContent(settings.all);
    expect(sSendMessage).toHaveBeenCalledWith({
      command: BackgroundCommand.IMPORT_SETTINGS_CALLBACK,
      value: { success: false, message: 'html_popup_import_settings_error' },
    });
  });

  it('Must return error if wrong data', async () => {
    const sLoggerError = jest.spyOn(Logger, 'error');
    const sSendMessage = jest.spyOn(chrome.runtime, 'sendMessage');
    const erroData = ['', 'string', null, undefined, []];
    for (let i = 0; i < erroData.length; i++) {
      await SettingsModule.sendBackImportedFileContent(erroData[i]);
      expect(sLoggerError).toHaveBeenCalledWith(
        new Error('Bad format or not object'),
      );
      expect(sSendMessage).toHaveBeenCalledWith({
        command: BackgroundCommand.IMPORT_SETTINGS_CALLBACK,
        value: {
          success: false,
          message: 'html_popup_import_settings_error',
        },
      });
    }
  });

  it('Must return sucess on empty settings', async () => {
    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockImplementation((...args: any[]) =>
        mocksImplementation.getValuefromLS(args[0], {
          customAuthorizedOP: noConfirm,
        } as CustomDataFromLocalStorage),
      );
    const sSendMessage = jest.spyOn(chrome.runtime, 'sendMessage');
    await SettingsModule.sendBackImportedFileContent({});
    expect(sSendMessage).toHaveBeenCalledWith({
      command: BackgroundCommand.IMPORT_SETTINGS_CALLBACK,
      value: {
        success: true,
        message: 'html_popup_import_settings_successful',
      },
    });
  });

  it('Must return success importing', async () => {
    const sSendMessage = jest.spyOn(chrome.runtime, 'sendMessage');
    const sSaveValueInLocalStorage = jest.spyOn(
      LocalStorageUtils,
      'saveValueInLocalStorage',
    );
    await SettingsModule.sendBackImportedFileContent(settings.all);
    expect(sSendMessage).toHaveBeenCalledWith({
      command: BackgroundCommand.IMPORT_SETTINGS_CALLBACK,
      value: {
        success: true,
        message: 'html_popup_import_settings_successful',
      },
    });
    expect(sSaveValueInLocalStorage).toHaveBeenCalledTimes(9);
  });

  it('Must import false values and claim savings', async () => {
    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue(undefined);
    const sSaveValueInLocalStorage = jest.spyOn(
      LocalStorageUtils,
      'saveValueInLocalStorage',
    );
    const sSendMessage = jest.spyOn(chrome.runtime, 'sendMessage');

    await SettingsModule.importSettings({
      [LocalStorageKeyEnum.KEYCHAINIFY_ENABLED]: false,
      [LocalStorageKeyEnum.SWITCH_RPC_AUTO]: false,
      [LocalStorageKeyEnum.CLAIM_SAVINGS]: {
        'keychain.tests': true,
      },
    });

    expect(sSaveValueInLocalStorage).toHaveBeenCalledWith(
      LocalStorageKeyEnum.KEYCHAINIFY_ENABLED,
      false,
    );
    expect(sSaveValueInLocalStorage).toHaveBeenCalledWith(
      LocalStorageKeyEnum.SWITCH_RPC_AUTO,
      false,
    );
    expect(sSaveValueInLocalStorage).toHaveBeenCalledWith(
      LocalStorageKeyEnum.CLAIM_SAVINGS,
      { 'keychain.tests': true },
    );
    expect(sSendMessage).not.toHaveBeenCalled();
  });

  it('Must merge Hive Engine custom settings from their own fields', async () => {
    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockImplementation((key: LocalStorageKeyEnum) => {
        if (
          key === LocalStorageKeyEnum.HIVE_ENGINE_CUSTOM_ACCOUNT_HISTORY_API
        ) {
          return Promise.resolve(['https://existing-history.example']);
        }
        if (key === LocalStorageKeyEnum.HIVE_ENGINE_CUSTOM_RPC_LIST) {
          return Promise.resolve(['https://existing-rpc.example']);
        }
        return Promise.resolve(undefined);
      });
    const sSaveValueInLocalStorage = jest.spyOn(
      LocalStorageUtils,
      'saveValueInLocalStorage',
    );

    await SettingsModule.importSettings({
      [LocalStorageKeyEnum.HIVE_ENGINE_CUSTOM_ACCOUNT_HISTORY_API]: [
        'https://imported-history.example',
      ],
      [LocalStorageKeyEnum.HIVE_ENGINE_CUSTOM_RPC_LIST]: [
        'https://imported-rpc.example',
      ],
    });

    expect(sSaveValueInLocalStorage).toHaveBeenCalledWith(
      LocalStorageKeyEnum.HIVE_ENGINE_CUSTOM_ACCOUNT_HISTORY_API,
      [
        'https://existing-history.example',
        'https://imported-history.example',
      ],
    );
    expect(sSaveValueInLocalStorage).toHaveBeenCalledWith(
      LocalStorageKeyEnum.HIVE_ENGINE_CUSTOM_RPC_LIST,
      ['https://existing-rpc.example', 'https://imported-rpc.example'],
    );
  });

  it('Must merge newer collection settings with existing values', async () => {
    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockImplementation((key: LocalStorageKeyEnum) => {
        if (key === LocalStorageKeyEnum.EVM_CUSTOM_TOKENS) {
          return Promise.resolve({ '0x1': [{ address: '0xexisting' }] });
        }
        if (key === LocalStorageKeyEnum.CUSTOM_CHAINS) {
          return Promise.resolve([{ chainId: '0x1' }]);
        }
        return Promise.resolve(undefined);
      });
    const sSaveValueInLocalStorage = jest.spyOn(
      LocalStorageUtils,
      'saveValueInLocalStorage',
    );

    await SettingsModule.importSettings({
      [LocalStorageKeyEnum.EVM_CUSTOM_TOKENS]: {
        '0x2': [{ address: '0ximported' }],
      },
      [LocalStorageKeyEnum.CUSTOM_CHAINS]: [{ chainId: '0x2' }],
    });

    expect(sSaveValueInLocalStorage).toHaveBeenCalledWith(
      LocalStorageKeyEnum.EVM_CUSTOM_TOKENS,
      {
        '0x1': [{ address: '0xexisting' }],
        '0x2': [{ address: '0ximported' }],
      },
    );
    expect(sSaveValueInLocalStorage).toHaveBeenCalledWith(
      LocalStorageKeyEnum.CUSTOM_CHAINS,
      [{ chainId: '0x1' }, { chainId: '0x2' }],
    );
  });

  it('Must ignore unsupported settings in a combined backup', async () => {
    const sSaveValueInLocalStorage = jest.spyOn(
      LocalStorageUtils,
      'saveValueInLocalStorage',
    );

    await SettingsModule.importSettings({ unsupportedSetting: true });

    expect(sSaveValueInLocalStorage).not.toHaveBeenCalled();
  });

  it('Must keep importing legacy no-confirm files', async () => {
    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue(undefined);
    const sSaveValueInLocalStorage = jest.spyOn(
      LocalStorageUtils,
      'saveValueInLocalStorage',
    );

    await SettingsModule.sendBackImportedFileContent(noConfirm);

    expect(sSaveValueInLocalStorage).toHaveBeenCalledWith(
      LocalStorageKeyEnum.NO_CONFIRM,
      noConfirm,
    );
  });

  it('Must not overwrite live LOCAL_STORAGE_VERSION from the import file', async () => {
    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue(undefined);
    const sSaveValueInLocalStorage = jest.spyOn(
      LocalStorageUtils,
      'saveValueInLocalStorage',
    );

    await SettingsModule.importSettings({
      [LocalStorageKeyEnum.LOCAL_STORAGE_VERSION]: 2,
      [LocalStorageKeyEnum.KEYCHAINIFY_ENABLED]: true,
    });

    expect(sSaveValueInLocalStorage).toHaveBeenCalledWith(
      LocalStorageKeyEnum.KEYCHAINIFY_ENABLED,
      true,
    );
    expect(sSaveValueInLocalStorage).not.toHaveBeenCalledWith(
      LocalStorageKeyEnum.LOCAL_STORAGE_VERSION,
      expect.anything(),
    );
  });

  it('Must merge EVM ENS entries by address without replacing existing ones', async () => {
    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockImplementation((key: LocalStorageKeyEnum) => {
        if (key === LocalStorageKeyEnum.EVM_ENS) {
          return Promise.resolve([
            {
              address: '0xAAA',
              ens: 'existing.eth',
              expirationDate: 1,
            },
          ]);
        }
        return Promise.resolve(undefined);
      });
    const sSaveValueInLocalStorage = jest.spyOn(
      LocalStorageUtils,
      'saveValueInLocalStorage',
    );

    await SettingsModule.importSettings({
      [LocalStorageKeyEnum.EVM_ENS]: [
        {
          address: '0xaaa',
          ens: 'imported-duplicate.eth',
          expirationDate: 2,
        },
        {
          address: '0xBBB',
          ens: 'imported.eth',
          expirationDate: 3,
        },
      ],
    });

    expect(sSaveValueInLocalStorage).toHaveBeenCalledWith(
      LocalStorageKeyEnum.EVM_ENS,
      [
        {
          address: '0xAAA',
          ens: 'existing.eth',
          expirationDate: 1,
        },
        {
          address: '0xBBB',
          ens: 'imported.eth',
          expirationDate: 3,
        },
      ],
    );
  });

  it('Must nested-merge EVM saved addresses by chain and address', async () => {
    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockImplementation((key: LocalStorageKeyEnum) => {
        if (key === LocalStorageKeyEnum.EVM_SAVED_ADDRESSES) {
          return Promise.resolve({
            '0x1': {
              '0xexisting': 'WALLET_ADDRESS',
            },
          });
        }
        return Promise.resolve(undefined);
      });
    const sSaveValueInLocalStorage = jest.spyOn(
      LocalStorageUtils,
      'saveValueInLocalStorage',
    );

    await SettingsModule.importSettings({
      [LocalStorageKeyEnum.EVM_SAVED_ADDRESSES]: {
        '0x1': {
          '0ximported': 'SMART_CONTRACT',
        },
        '0x2': {
          '0xother': 'WALLET_ADDRESS',
        },
      },
    });

    expect(sSaveValueInLocalStorage).toHaveBeenCalledWith(
      LocalStorageKeyEnum.EVM_SAVED_ADDRESSES,
      {
        '0x1': {
          '0xexisting': 'WALLET_ADDRESS',
          '0ximported': 'SMART_CONTRACT',
        },
        '0x2': {
          '0xother': 'WALLET_ADDRESS',
        },
      },
    );
  });

  it('Must normalize legacy settings shapes before importing', async () => {
    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue(undefined);
    const sSaveValueInLocalStorage = jest.spyOn(
      LocalStorageUtils,
      'saveValueInLocalStorage',
    );

    await SettingsModule.importSettings({
      [LocalStorageKeyEnum.LOCAL_STORAGE_VERSION]: 2,
      [LocalStorageKeyEnum.AUTOLOCK]: JSON.stringify({
        type: 1,
        mn: 10,
      }),
      [LocalStorageKeyEnum.NO_CONFIRM]: JSON.stringify(noConfirm),
      [LocalStorageKeyEnum.CURRENT_RPC]: {
        uri: 'https://anyx.io',
        testnet: false,
      },
      [LocalStorageKeyEnum.FAVORITE_USERS]: {
        'keychain.tests': ['alice', { value: 'bob', subLabel: 'friend' }],
      },
    });

    expect(sSaveValueInLocalStorage).toHaveBeenCalledWith(
      LocalStorageKeyEnum.AUTOLOCK,
      { type: 1, mn: 10 },
    );
    expect(sSaveValueInLocalStorage).toHaveBeenCalledWith(
      LocalStorageKeyEnum.NO_CONFIRM,
      noConfirm,
    );
    expect(sSaveValueInLocalStorage).toHaveBeenCalledWith(
      LocalStorageKeyEnum.CURRENT_RPC,
      { uri: 'https://api.hive.blog', testnet: false },
    );
    expect(sSaveValueInLocalStorage).toHaveBeenCalledWith(
      LocalStorageKeyEnum.FAVORITE_USERS,
      {
        'keychain.tests': [
          { label: 'alice', subLabel: '' },
          { label: 'bob', subLabel: 'friend' },
        ],
      },
    );
    expect(sSaveValueInLocalStorage).not.toHaveBeenCalledWith(
      LocalStorageKeyEnum.LOCAL_STORAGE_VERSION,
      expect.anything(),
    );
  });

  it('Must skip unmergeable settings and keep importing the rest', async () => {
    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue(undefined);
    const sSaveValueInLocalStorage = jest.spyOn(
      LocalStorageUtils,
      'saveValueInLocalStorage',
    );
    const sLoggerError = jest.spyOn(Logger, 'error');

    await SettingsModule.importSettings({
      [LocalStorageKeyEnum.KEYCHAINIFY_ENABLED]: true,
      [LocalStorageKeyEnum.RPC_LIST]: 'not-an-array',
      [LocalStorageKeyEnum.EVM_CUSTOM_TOKENS]: ['not-a-record'],
      [LocalStorageKeyEnum.CLAIM_SAVINGS]: {
        'keychain.tests': true,
      },
      [LocalStorageKeyEnum.EVM_ENS]: { address: '0xabc' },
    });

    expect(sSaveValueInLocalStorage).toHaveBeenCalledWith(
      LocalStorageKeyEnum.KEYCHAINIFY_ENABLED,
      true,
    );
    expect(sSaveValueInLocalStorage).toHaveBeenCalledWith(
      LocalStorageKeyEnum.CLAIM_SAVINGS,
      { 'keychain.tests': true },
    );
    expect(sSaveValueInLocalStorage).not.toHaveBeenCalledWith(
      LocalStorageKeyEnum.RPC_LIST,
      expect.anything(),
    );
    expect(sSaveValueInLocalStorage).not.toHaveBeenCalledWith(
      LocalStorageKeyEnum.EVM_CUSTOM_TOKENS,
      expect.anything(),
    );
    expect(sSaveValueInLocalStorage).not.toHaveBeenCalledWith(
      LocalStorageKeyEnum.EVM_ENS,
      expect.anything(),
    );
    expect(sLoggerError).toHaveBeenCalledWith(
      'Ignoring unmergeable imported setting: rpc',
    );
    expect(sLoggerError).toHaveBeenCalledWith(
      'Ignoring unmergeable imported setting: EVM_CUSTOM_TOKENS',
    );
    expect(sLoggerError).toHaveBeenCalledWith(
      'Ignoring unmergeable imported setting: EVM_ENS',
    );
  });
});
