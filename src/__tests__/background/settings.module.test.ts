import SettingsModule from '@background/settings.module';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
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
      value: 'html_popup_import_settings_error',
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
        value: 'html_popup_import_settings_error',
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
      value: 'html_popup_import_settings_successful',
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
      value: 'html_popup_import_settings_successful',
    });
    expect(sSaveValueInLocalStorage).toHaveBeenCalledTimes(9);
  });
});
