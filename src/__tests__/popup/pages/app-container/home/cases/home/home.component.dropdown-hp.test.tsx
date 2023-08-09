import App from '@popup/App';
import { Icons } from '@popup/icons.enum';
import { HpDropdownMenuItems } from '@popup/pages/app-container/home/wallet-info-section/wallet-info-dropdown-menus.list';
import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdDropdown from 'src/__tests__/utils-for-testing/data-testid/data-testid-dropdown';
import dataTestIdIcon from 'src/__tests__/utils-for-testing/data-testid/data-testid-icon';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import CurrencyUtils from 'src/utils/currency.utils';
describe('home.component dropdown hp tests:\n', () => {
  beforeEach(async () => {
    await reactTestingLibrary.renderWithConfiguration(
      <App />,
      initialStates.iniStateAs.defaultExistent,
      {
        app: {
          accountsRelated: {
            AccountUtils: {
              getAccountsFromLocalStorage: accounts.twoAccounts,
            },
          },
        },
      },
    );
    await act(async () => {
      await userEvent.click(
        screen.getByTestId(
          dataTestIdDropdown.arrow.preFix +
            CurrencyUtils.getCurrencyLabels(false).hp.toLowerCase(),
        ),
      );
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  it('Must open each page when clicking on menu item', async () => {
    for (let i = 0; i < HpDropdownMenuItems.length; i++) {
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(
            dataTestIdDropdown.walletInfo.preFix + HpDropdownMenuItems[i].icon,
          ),
        );
      });
      if (
        HpDropdownMenuItems[i].icon === Icons.ARROW_DOWNWARDS ||
        HpDropdownMenuItems[i].icon === Icons.ARROW_UPWARDS
      ) {
        expect(
          await screen.findByTestId(`${Screen.POWER_UP_PAGE}-page`),
        ).toBeInTheDocument();
      } else {
        expect(
          await screen.findByTestId(
            `${HpDropdownMenuItems[i].nextScreen}-page`,
          ),
        ).toBeInTheDocument();
      }
      await act(async () => {
        await userEvent.click(screen.getByTestId(dataTestIdIcon.closePage));
        await userEvent.click(
          screen.getByTestId(
            dataTestIdDropdown.arrow.preFix +
              CurrencyUtils.getCurrencyLabels(false).hp.toLowerCase(),
          ),
        );
      });
    }
  });
});
