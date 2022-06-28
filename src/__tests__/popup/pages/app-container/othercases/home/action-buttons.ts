import { screen } from '@testing-library/react';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
/**
 * Extra cases executions
 */
const run = () => {
  it('Must open transfer funds page when clicking on send', async () => {
    await clickAwait([alButton.actionBtn.send]);
    assertion.getByLabelText(alComponent.transfersFundsPage);
  });
  it('Must show wallet history when clicking on history', async () => {
    await clickAwait([alButton.actionBtn.history]);
    jest.runAllTimers();
    screen.debug();
    await assertion.awaitFor(alComponent.walletItemList, QueryDOM.BYLABEL);
    //assertion.getByLabelText(alComponent.walletItemList);
  });
  it('Must show tokens page when clicking on tokens', async () => {
    await clickAwait([alButton.actionBtn.tokens]);
    await assertion.awaitFor(alComponent.userTokens, QueryDOM.BYLABEL);
    //assertion.getByLabelText(alComponent.userTokens);
  });
  it('Must show governance page when clicking on governance', async () => {
    // KeychainApi.get = jest
    //   .fn()
    //   .mockResolvedValue(utilsT.fakeWitnessesRankingResponse);
    // ProxyUtils.findUserProxy = jest.fn();
    // WitnessUtils.unvoteWitness = jest.fn();
    // BlockchainTransactionUtils.delayRefresh = jest.fn();

    await clickAwait([alButton.actionBtn.governance]);
    assertion.getByLabelText(alComponent.governancePage);
  });
};

export default { run };
