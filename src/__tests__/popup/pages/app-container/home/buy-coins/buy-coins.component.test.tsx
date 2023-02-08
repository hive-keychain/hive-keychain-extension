import App from '@popup/App';
import { BuyCoinType } from '@popup/pages/app-container/home/buy-coins/buy-coin-type.enum';
import { BuyCoinsListItem } from '@popup/pages/app-container/home/buy-coins/buy-coins-list-item.list';
import '@testing-library/jest-dom';
import { act, screen } from '@testing-library/react';
import React from 'react';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alSwitches from 'src/__tests__/utils-for-testing/aria-labels/al-switches';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';
config.byDefault();
describe('buy-coins.component tests:\n', () => {
  beforeEach(async () => {
    jest.useFakeTimers('legacy');
    act(() => {
      jest.advanceTimersByTime(4300);
    });
    mockPreset.setOrDefault({});
    customRender(<App />, {
      initialState: initialStates.iniStateAs.defaultExistent,
    });
    await assertion.awaitMk(mk.user.one);
  });
  afterEach(() => {
    afterTests.clean();
  });
  it('Must show the list of exchanges for hive', async () => {
    await clickAwait([alButton.actionBtn.buy]);
    const linksFound = screen.getAllByRole('link');
    let index = 0;
    BuyCoinsListItem(BuyCoinType.BUY_HIVE, userData.one.username).list.map(
      (listItem) => {
        expect(linksFound[index]).toHaveAttribute('href', listItem.link);
        index += 1;
      },
    );
  });
  it('Must show the list of exchanges for hbd', async () => {
    await clickAwait([alButton.actionBtn.buy, alSwitches.buyCoins.buyCoins]);
    const linksFound = screen.getAllByRole('link');
    let index = 0;
    BuyCoinsListItem(BuyCoinType.BUY_HDB, userData.one.username).list.map(
      (listItem) => {
        expect(linksFound[index]).toHaveAttribute('href', listItem.link);
        index += 1;
      },
    );
  });
});
