import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdSwitch from 'src/__tests__/utils-for-testing/data-testid/data-testid-switch';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { Icons } from 'src/common-ui/icons.enum';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';
import { ActionButtonList } from 'src/popup/hive/pages/app-container/home/actions-section/action-button.list';
import { BuyCoinType } from 'src/popup/hive/pages/app-container/home/buy-coins/buy-coin-type.enum';
import { BuyCoinsListItem } from 'src/popup/hive/pages/app-container/home/buy-coins/buy-coins-list-item.list';

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
      <HiveAppComponent />,
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
        await screen.findByTestId(
          dataTestIdButton.actionBtn.preFix + actionButtonIconBuy,
        ),
      );
    });
    expect(
      await screen.findByTestId(`${Screen.BUY_COINS_PAGE}-page`),
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
        await screen.findByTestId(
          dataTestIdButton.actionBtn.preFix + actionButtonIconBuy,
        ),
      );
      await userEvent.click(
        await screen.findByTestId(dataTestIdSwitch.buyCoins.buyCoins),
      );
    });
    expect(
      await screen.findByTestId(`${Screen.BUY_COINS_PAGE}-page`),
    ).toBeInTheDocument();
    const linksFound = await screen.findAllByRole('link');
    for (let i = 0; i < BuyCoinListHBD.length; i++) {
      expect(linksFound[i]).toHaveAttribute('href', BuyCoinListHBD[i].link);
    }
  });
});
