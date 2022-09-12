import { DefaultHiveEngineRpcs } from '@interfaces/hive-engine-rpc.interface';
import { screen } from '@testing-library/react';
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
  describe('Rpc selector:\n', () => {
    describe('With custom rpc nodes', () => {
      beforeEach(async () => {
        _asFragment = await tokensSettings.beforeEach({
          customRpcList: ['https://saturnoman.com/rpc'],
        });
      });
      it('Must show defaults + custom rpc loaded', async () => {
        await clickAwait([alSelect.tokens.settings.panel.rpcNode]);
        await assertion.allToHaveLength(
          alSelect.tokens.settings.items.rpcNode,
          DefaultHiveEngineRpcs.length + 1,
        );
      });
      it('Must delete selected rpc, reload rpc list and show it', async () => {
        extraMocks.deleteCustomRpc();
        await clickAwait([
          alSelect.tokens.settings.panel.rpcNode,
          alImg.tokens.settings.eraseRpc,
        ]);
        await clickAwait([alSelect.tokens.settings.panel.rpcNode]);
        await assertion.allToHaveLength(
          alSelect.tokens.settings.items.rpcNode,
          DefaultHiveEngineRpcs.length,
        );
      });
    });
    describe('With no custom rpc', () => {
      beforeEach(async () => {
        _asFragment = await tokensSettings.beforeEach();
      });
      it('Must show default rpcs', async () => {
        await clickAwait([alSelect.tokens.settings.panel.rpcNode]);
        await assertion.allToHaveLength(
          alSelect.tokens.settings.items.rpcNode,
          DefaultHiveEngineRpcs.length,
        );
      });
      it('Must set selected rpc', async () => {
        extraMocks.setActiveApi();
        await clickAwait([alSelect.tokens.settings.panel.rpcNode]);
        await clickAwaitOnFound(alSelect.tokens.settings.items.rpcNode, 1);
        assertion.toHaveTextContent([
          {
            arialabel: alSelect.tokens.settings.panel.rpcNode,
            text: methods.cleanStr(DefaultHiveEngineRpcs[1]),
          },
        ]);
      });
      it('Must show error adding existent rpc', async () => {
        await methods.clickInputAction('rpcNode', DefaultHiveEngineRpcs[1]);
        await assertion.awaitFor(messages.rpcNode.existent, QueryDOM.BYTEXT);
      });
      it('Must show error adding non valid url rpc', async () => {
        await methods.clickInputAction('rpcNode', 'non-valid-@url.@');
        await assertion.awaitFor(messages.invalidUrl, QueryDOM.BYTEXT);
      });
      it('Must show error if empty input', async () => {
        await methods.clickInputAction('rpcNode', '{space}');
        await assertion.awaitFor(messages.invalidUrl, QueryDOM.BYTEXT);
      });
      it('Must add custom rpc', async () => {
        extraMocks.addCustomRpc();
        await methods.clickInputAction(
          'rpcNode',
          'https://api.hive.keychain.com',
        );
        await assertion.awaitFor(messages.rpcNode.success, QueryDOM.BYTEXT);
        screen.debug();
      });
    });
  });
});
