import App from '@popup/App';
import { Icons } from '@popup/icons.enum';
import { ActionButtonList } from '@popup/pages/app-container/home/actions-section/action-button.list';
import { BuyCoinType } from '@popup/pages/app-container/home/buy-coins/buy-coin-type.enum';
import { BuyCoinsListItem } from '@popup/pages/app-container/home/buy-coins/buy-coins-list-item.list';
import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ariaLabelButton from 'src/__tests__/utils-for-testing/aria-labels/aria-label-button';
import ariaLabelSwitch from 'src/__tests__/utils-for-testing/aria-labels/aria-label-switch';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';

describe('buy-coins.component tests:\n', () => {
  const actionButtonIconBuy = ActionButtonList.find(
    (actionButton) => actionButton.icon === Icons.BUY,
  )!.icon;
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  beforeEach(async () => {
    await reactTestingLibrary.renderWithConfiguration(
      <App />,
      initialStates.iniStateAs.defaultExistent,
    );
  });

  it('Must show the buy coins page & list of exchanges for hive', async () => {
    const BuyCoinListHIVE = BuyCoinsListItem(
      BuyCoinType.BUY_HIVE,
      mk.user.one,
    ).list;
    await act(async () => {
      await userEvent.click(
        await screen.findByLabelText(
          ariaLabelButton.actionBtn.preFix + actionButtonIconBuy,
        ),
      );
    });
    expect(
      await screen.findByLabelText(`${Screen.BUY_COINS_PAGE}-page`),
    ).toBeInTheDocument();
    const linksFound = await screen.findAllByRole('link');
    for (let i = 0; i < BuyCoinListHIVE.length; i++) {
      expect(linksFound[i]).toHaveAttribute('href', BuyCoinListHIVE[i].link);
    }
  });

  it('Must show the buy coins page & list of exchanges for HBD', async () => {
    const BuyCoinListHBD = BuyCoinsListItem(
      BuyCoinType.BUY_HDB,
      mk.user.one,
    ).list;
    await act(async () => {
      await userEvent.click(
        await screen.findByLabelText(
          ariaLabelButton.actionBtn.preFix + actionButtonIconBuy,
        ),
      );
      await userEvent.click(
        await screen.findByLabelText(ariaLabelSwitch.buyCoins.buyCoins),
      );
    });
    expect(
      await screen.findByLabelText(`${Screen.BUY_COINS_PAGE}-page`),
    ).toBeInTheDocument();
    const linksFound = await screen.findAllByRole('link');
    for (let i = 0; i < BuyCoinListHBD.length; i++) {
      expect(linksFound[i]).toHaveAttribute('href', BuyCoinListHBD[i].link);
    }
  });
});
