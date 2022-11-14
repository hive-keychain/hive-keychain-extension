import { DefaultRpcs } from '@reference-data/default-rpc.list';
import rpcNodes from 'src/__tests__/popup/pages/app-container/settings/advanced-settings/rpc-nodes/mocks/rpc-nodes';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alCheckbox from 'src/__tests__/utils-for-testing/aria-labels/al-checkbox';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alImg from 'src/__tests__/utils-for-testing/aria-labels/al-img';
import alSelect from 'src/__tests__/utils-for-testing/aria-labels/al-select';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
describe('rpc-nodes.component tests:\n', () => {
  let _asFragment: () => DocumentFragment;
  const { methods, constants, extraMocks } = rpcNodes;
  const { message, data } = constants;
  methods.afterEach;
  describe('Switch rpc auto:\n', () => {
    beforeEach(async () => {
      _asFragment = await rpcNodes.beforeEach();
    });
    it('Must load component and info', () => {
      assertion.getByLabelText(alComponent.advanceSettings.rpcNodes);
      assertion.getOneByText(constants.message.intro);
    });

    it('Must show add rpc button', async () => {
      await clickAwait([alCheckbox.rpcNodes.select.automaticMode]);
      assertion.getByLabelText(alButton.rpcNodes.addRpc);
    });
  });
  describe('Not auto:\n', () => {
    beforeEach(async () => {
      _asFragment = await rpcNodes.beforeEach({
        customSwitchAuto: false,
        customsRpcs: [{ uri: 'https://saturnoman.com/rpc', testnet: false }],
      });
    });
    it('Must load component and info', () => {
      assertion.getByLabelText(alComponent.advanceSettings.rpcNodes);
      assertion.getOneByText(constants.message.intro);
    });

    it('Must hide add rpc button', async () => {
      await clickAwait([alCheckbox.rpcNodes.select.automaticMode]);
      assertion.queryByLabel(alButton.rpcNodes.addRpc, false);
    });

    it('Must show error if empty uri', async () => {
      await methods.typeNClick({ input: '{space}' });
      await assertion.awaitFor(message.missingFields, QueryDOM.BYTEXT);
    });

    it('Must show error if invalid uri', async () => {
      await methods.typeNClick({ input: data.invalidUri });
      await assertion.awaitFor(message.invalidUri, QueryDOM.BYTEXT);
    });

    it('Must show error empty node chain Id', async () => {
      await methods.typeNClick({ input: data.toAdd, checkTestnet: true });
      await assertion.awaitFor(message.missingFields, QueryDOM.BYTEXT);
    });

    it('Must show error if new rpc exists', async () => {
      await methods.typeNClick({ input: DefaultRpcs[0].uri });
      await assertion.awaitFor(message.existingUri, QueryDOM.BYTEXT);
    });

    it('Must add new rpc and show it in list', async () => {
      await methods.typeNClick({ input: data.toAdd });
      await clickAwait([alSelect.rpcNode.selected]);
      assertion.getByLabelText(alSelect.rpcNode.selectItem.preFix + data.toAdd);
    });

    it('Must add new rpc and set it as active rpc', async () => {
      await methods.typeNClick({ input: data.toAdd, setAsActive: true });
      expect(extraMocks.setRpc.mock.lastCall).toEqual(data.newRpc);
      await clickAwait([alSelect.rpcNode.selected]);
      assertion.getByLabelText(alSelect.rpcNode.selectItem.preFix + data.toAdd);
    });

    it('Must remove a custom rpc node from list', async () => {
      await clickAwait([
        alSelect.rpcNode.selected,
        alImg.rpcNodes.delete,
        alSelect.rpcNode.selected,
      ]);
      assertion.queryByLabel(
        alSelect.rpcNode.selectItem.preFix + data.toAdd,
        false,
      );
    });
  });
});
