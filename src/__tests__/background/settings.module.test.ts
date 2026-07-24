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
});
