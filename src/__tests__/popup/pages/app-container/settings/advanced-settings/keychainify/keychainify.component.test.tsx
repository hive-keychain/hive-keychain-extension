import keychainify from 'src/__tests__/popup/pages/app-container/settings/advanced-settings/keychainify/mocks/keychainify';
import alCheckbox from 'src/__tests__/utils-for-testing/aria-labels/al-checkbox';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
describe('keychainify.component tests:\n', () => {
  let _asFragment: () => DocumentFragment;
  const { methods, constants, extraMocks } = keychainify;
  methods.afterEach;
  beforeEach(async () => {
    _asFragment = await keychainify.beforeEach();
  });
  it('Must load component and match show intro message', () => {
    assertion.getByLabelText(alComponent.advanceSettings.link);
    assertion.getOneByText(constants.message.intro);
  });
  it('Must set keychainify', async () => {
    await clickAwait([alCheckbox.keychainify.checkbox]);
    expect(extraMocks.spy().mock.lastCall).toEqual([
      'keychainify_enabled',
      false,
    ]);
  });
});
