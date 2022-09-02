import SettingsModule from '@background/settings.module';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import settingsModuleMocks from 'src/__tests__/background/mocks/settings.module.mocks';
import settings from 'src/__tests__/utils-for-testing/data/settings';
describe('settings.module tests:\n', () => {
  const { spies, methods, mocks, constants } = settingsModuleMocks;
  const { erroData, noConfirm } = constants;
  methods.afterEach;
  methods.beforeEach;
  it('Must return error if saving fails', async () => {
    mocks.saveValueInLocalStorage(true);
    await SettingsModule.sendBackImportedFileContent(settings.all);
    expect(spies.logger.error).toBeCalledWith('Not possible to save!');
    methods.assertSendMessage('html_popup_import_settings_error');
  });
  it('Must return error if wrong data', async () => {
    for (let i = 0; i < erroData.length; i++) {
      await SettingsModule.sendBackImportedFileContent(erroData[i]);
      expect(spies.logger.error).toBeCalledWith(
        new Error('Bad format or not object'),
      );
      methods.assertSendMessage('html_popup_import_settings_error');
      spies.logger.error.mockReset();
    }
  });
  it('Will return sucess on empty settings', async () => {
    mocks.getValueFromLocalStorage({
      customAuthorizedOP: noConfirm,
    });
    await SettingsModule.sendBackImportedFileContent({});
    methods.assertSendMessage('html_popup_import_settings_successful');
  });
  it('Must return success importing', async () => {
    mocks.getValueFromLocalStorage({
      customAuthorizedOP: noConfirm,
    });
    await SettingsModule.sendBackImportedFileContent(settings.all);
    methods.assertSendMessage('html_popup_import_settings_successful');
    expect(spies.saveValueInLocalStorage()).toBeCalledTimes(9);
  });
  it('Must return success importing(no existingNoConfirm)', async () => {
    mocks.getValueFromLocalStorage({
      customAuthorizedOP: undefined,
    });
    await SettingsModule.sendBackImportedFileContent(settings.all);
    methods.assertSendMessage('html_popup_import_settings_successful');
    expect(spies.saveValueInLocalStorage()).toBeCalledTimes(9);
  });
  it('Must save noConfirm values(no existingNoConfirm)', async () => {
    mocks.getValueFromLocalStorage({
      customAuthorizedOP: undefined,
    });
    await SettingsModule.sendBackImportedFileContent(settings.justNoConfirm);
    expect(spies.saveValueInLocalStorage()).toBeCalledWith(
      LocalStorageKeyEnum.NO_CONFIRM,
      settings.justNoConfirm,
    );
    methods.assertSendMessage('html_popup_import_settings_successful');
  });
  it('Must save noConfirm values(with existingNoConfirm)', async () => {
    mocks.getValueFromLocalStorage({
      customAuthorizedOP: noConfirm,
    });
    await SettingsModule.sendBackImportedFileContent(settings.justNoConfirm);
    expect(spies.saveValueInLocalStorage()).toBeCalledWith(
      LocalStorageKeyEnum.NO_CONFIRM,
      noConfirm,
    );
    methods.assertSendMessage('html_popup_import_settings_successful');
  });
});
