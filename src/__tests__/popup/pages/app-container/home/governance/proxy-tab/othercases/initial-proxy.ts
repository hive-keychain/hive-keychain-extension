import proxy from 'src/__tests__/popup/pages/app-container/home/governance/proxy-tab/mocks/proxy';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';

const { constants, extraMocks } = proxy;

const run = () => {
  it('Must show intro message and current proxy account', () => {
    assertion.getOneByText(constants.introMessage.proxy);
  });
  it('Must remove proxy and show message', async () => {
    extraMocks({ removeProxy: true });
    await clickAwait([alButton.operation.proxy.tab.clear]);
    await assertion.awaitFor(constants.successClear, QueryDOM.BYTEXT);
  });
  it('Must show error trying to clear the proxy', async () => {
    extraMocks({ removeProxy: false });
    await clickAwait([alButton.operation.proxy.tab.clear]);
    await assertion.awaitFor(constants.errorMessage.clear, QueryDOM.BYTEXT);
  });
};

export default { run };
