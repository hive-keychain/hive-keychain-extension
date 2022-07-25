import { screen } from '@testing-library/react';
import tokensSettings from 'src/__tests__/popup/pages/app-container/home/tokens/tokens-settings/mocks/tokens-settings';
import alSelect from 'src/__tests__/utils-for-testing/aria-labels/al-select';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
const { methods, constants } = tokensSettings;
//const { panel } = constants;
let _asFragment: () => {};
describe('tokens-settings.component tests:\n', () => {
  methods.afterEach;
  describe('Account History API Selector:\n', () => {
    describe('With custom account history api', () => {});
    describe('With no custom account history api', () => {
      beforeEach(async () => {
        _asFragment = await tokensSettings.beforeEach();
        // await methods.clickOnSelect(panel.rpc);
      });
      it('Must load ', async () => {
        await clickAwait([alSelect.tokens.settings.panel.rpcNode]);
        screen.debug();
      });
    });
  });
});
