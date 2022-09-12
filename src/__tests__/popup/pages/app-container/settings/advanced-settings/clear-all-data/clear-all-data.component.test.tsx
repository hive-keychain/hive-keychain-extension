import clearAllData from 'src/__tests__/popup/pages/app-container/settings/advanced-settings/clear-all-data/mocks/clear-all-data';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
describe('clear-all-data.component tests:\n', () => {
  let _asFragment: () => {};
  const { methods, extraMocks, constants } = clearAllData;
  methods.afterEach;
  beforeEach(async () => {
    _asFragment = await clearAllData.beforeEach();
  });
  it('Must show page and match snapshot', () => {
    expect(_asFragment()).toMatchSnapshot(constants.snapshotName.default);
  });
  it('Must go back when pressing cancel', async () => {
    await clickAwait([alButton.dialog.cancel]);
    assertion.getByLabelText(alComponent.settingsPage);
  });
  it('Must clear user data and go home', async () => {
    extraMocks.remockAsNew();
    await clickAwait([alButton.dialog.confirm]);
    await assertion.awaitFor(alComponent.signUp, QueryDOM.BYLABEL);
  });
});
