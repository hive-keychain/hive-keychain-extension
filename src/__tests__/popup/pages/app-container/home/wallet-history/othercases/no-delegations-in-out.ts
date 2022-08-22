import { screen } from '@testing-library/react';
import walletHistory from 'src/__tests__/popup/pages/app-container/home/wallet-history/mocks/wallet-history';
import alDiv from 'src/__tests__/utils-for-testing/aria-labels/al-div';
import {
  actAdvanceTime,
  clickAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
const { constants, filters, prefix } = walletHistory;
const run = () => {
  const noDelegations = filters.filter(
    (filter) => filter !== 'delegate_vesting_shares',
  );
  noDelegations.forEach((filter) => {
    it(`Must show IN transactions when applied filter ${filter}`, async () => {
      await clickAwait([
        alDiv.wallet.history.filterPanel,
        prefix + filter,
        alDiv.wallet.history.byIn,
      ]);
      actAdvanceTime(200);
      expect(screen.getAllByLabelText(alDiv.wallet.history.item).length).toBe(
        constants.results.in[filter],
      );
    });
    it(`Must show OUT transactions when applied filter ${filter}`, async () => {
      await clickAwait([
        alDiv.wallet.history.filterPanel,
        prefix + filter,
        alDiv.wallet.history.byOut,
      ]);
      actAdvanceTime(200);
      expect(screen.queryAllByLabelText(alDiv.wallet.history.item).length).toBe(
        constants.results.out[filter],
      );
    });
  });
};

export default { run };
