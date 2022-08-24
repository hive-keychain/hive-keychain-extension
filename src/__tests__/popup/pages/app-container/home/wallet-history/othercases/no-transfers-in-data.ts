import walletHistory from 'src/__tests__/popup/pages/app-container/home/wallet-history/mocks/wallet-history';
import alDiv from 'src/__tests__/utils-for-testing/aria-labels/al-div';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import {
  actAdvanceTime,
  clickAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
const { constants, prefix } = walletHistory;

const run = () => {
  it('Must show no data when selected transfer filter', async () => {
    await clickAwait([alDiv.wallet.history.filterPanel, prefix + 'transfer']);
    actAdvanceTime(200);
    assertion.getManyByText([
      constants.error.emptyList,
      constants.error.tryClearFilter,
    ]);
  });
};

export default { run };
