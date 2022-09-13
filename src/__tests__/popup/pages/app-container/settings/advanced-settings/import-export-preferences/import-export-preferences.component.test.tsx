import { Icons } from '@popup/icons.enum';
import importExportPreferences from 'src/__tests__/popup/pages/app-container/settings/advanced-settings/import-export-preferences/mocks/import-export-preferences';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
describe('import-export-preferences.component tests:\n', () => {
  let _asFragment: () => DocumentFragment;
  const { methods, constants, extraMocks } = importExportPreferences;
  methods.afterEach;
  beforeEach(async () => {
    _asFragment = await importExportPreferences.beforeEach();
  });
  it('Must load import-export page and match snapshot', () => {
    expect(_asFragment()).toMatchSnapshot(constants.snapshotName.default);
  });
  it('Must open import window', async () => {
    await clickAwait([alButton.menuPreFix + Icons.IMPORT]);
    expect(extraMocks.spy.importSettings).toBeCalledTimes(1);
  });
  it('Must try to export settings file', async () => {
    extraMocks.getMultipleValueFromLocalStorage();
    extraMocks.aClick;
    await clickAwait([alButton.menuPreFix + Icons.EXPORT]);
    expect(extraMocks.spy.exportSettings).toBeCalledTimes(1);
    expect(extraMocks.aClick).toBeCalledTimes(1);
  });
});
