import { DefaultAccountHistoryApis } from '@interfaces/hive-engine-rpc.interface';
import tokensSettings from 'src/__tests__/popup/pages/app-container/home/tokens/tokens-settings/mocks/tokens-settings';
import alImg from 'src/__tests__/utils-for-testing/aria-labels/al-img';
import alSelect from 'src/__tests__/utils-for-testing/aria-labels/al-select';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import {
  clickAwait,
  clickAwaitOnFound,
} from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
const { methods, constants, extraMocks } = tokensSettings;
const { messages } = constants;
let _asFragment: () => {};
describe('tokens-settings.component tests:\n', () => {
  methods.afterEach;
  describe('Account History Api selector:\n', () => {
    describe('With custom account history nodes', () => {
      beforeEach(async () => {
        _asFragment = await tokensSettings.beforeEach({
          accountHistoryApi: ['https://saturnoman.com/accountHistory'],
        });
      });
      it('Must show defaults + custom account history api loaded', async () => {
        await clickAwait([alSelect.tokens.settings.panel.accountHistoryApi]);
        await assertion.allToHaveLength(
          alSelect.tokens.settings.items.accountHistoryApi,
          DefaultAccountHistoryApis.length + 1,
        );
      });
      it('Must delete selected rpc, reload rpc list and show it', async () => {
        extraMocks.deleteCustomAccountHistoryApi();
        await clickAwait([
          alSelect.tokens.settings.panel.accountHistoryApi,
          alImg.tokens.settings.eraseRpc,
        ]);
        await clickAwait([alSelect.tokens.settings.panel.accountHistoryApi]);
        await assertion.allToHaveLength(
          alSelect.tokens.settings.items.accountHistoryApi,
          DefaultAccountHistoryApis.length,
        );
      });
    });
    describe('With no custom account history', () => {
      beforeEach(async () => {
        _asFragment = await tokensSettings.beforeEach();
      });
      //todo rest cases
      it('Must show default account history apis', async () => {
        await clickAwait([alSelect.tokens.settings.panel.accountHistoryApi]);
        await assertion.allToHaveLength(
          alSelect.tokens.settings.items.accountHistoryApi,
          DefaultAccountHistoryApis.length,
        );
      });
      it('Must set selected account history api', async () => {
        extraMocks.setActiveAccountHistoryApi();
        await clickAwait([alSelect.tokens.settings.panel.accountHistoryApi]);
        await clickAwaitOnFound(
          alSelect.tokens.settings.items.accountHistoryApi,
          1,
        );
        assertion.toHaveTextContent([
          {
            arialabel: alSelect.tokens.settings.panel.accountHistoryApi,
            text: methods.cleanStr(DefaultAccountHistoryApis[1]),
          },
        ]);
      });
      it('Must show error adding existent account history api', async () => {
        await methods.clickInputAction(
          'accountHistory',
          DefaultAccountHistoryApis[1],
        );
        await assertion.awaitFor(messages.rpcNode.existent, QueryDOM.BYTEXT);
      });
      it('Must show error adding non valid url', async () => {
        await methods.clickInputAction('accountHistory', 'non-valid-@url.@');
        await assertion.awaitFor(messages.invalidUrl, QueryDOM.BYTEXT);
      });
      it('Must show error if empty input', async () => {
        await methods.clickInputAction('accountHistory', '{space}');
        await assertion.awaitFor(messages.invalidUrl, QueryDOM.BYTEXT);
      });
      it('Must add custom account history api', async () => {
        extraMocks.addCustomAccountHistoryApi();
        await methods.clickInputAction(
          'accountHistory',
          'https://api.keychain.com/accountHistory',
        );
        await assertion.awaitFor(
          messages.accountHistory.success,
          QueryDOM.BYTEXT,
        );
      });
    });
  });
});
