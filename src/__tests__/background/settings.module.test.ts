import SettingsModule from '@background/settings.module';
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
  it('Must return sucess on empty settings', async () => {
    mocks.getValueFromLocalStorage({
      customAuthorizedOP: noConfirm,
    });
    await SettingsModule.sendBackImportedFileContent({});
    methods.assertSendMessage('html_popup_import_settings_successful');
  });
  it('Must return success importing', async () => {
    await SettingsModule.sendBackImportedFileContent(settings.all);
    methods.assertSendMessage('html_popup_import_settings_successful');
    expect(spies.saveValueInLocalStorage()).toBeCalledTimes(9);
  });
});
