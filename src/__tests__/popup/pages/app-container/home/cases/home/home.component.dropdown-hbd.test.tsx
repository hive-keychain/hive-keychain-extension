import App from '@popup/App';
import { Icons } from '@popup/icons.enum';
import { HBDDropdownMenuItems } from '@popup/pages/app-container/home/wallet-info-section/wallet-info-dropdown-menus.list';
import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ariaLabelDropdown from 'src/__tests__/utils-for-testing/aria-labels/aria-label-dropdown';
import ariaLabelIcon from 'src/__tests__/utils-for-testing/aria-labels/aria-label-icon';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import CurrencyUtils from 'src/utils/currency.utils';
describe('home.component dropdown hbd tests:\n', () => {
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
        screen.getByLabelText(
          ariaLabelDropdown.arrow.preFix +
            CurrencyUtils.getCurrencyLabels(false).hbd.toLowerCase(),
        ),
      );
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });

  it('Must open each menu item', async () => {
    for (let i = 0; i < HBDDropdownMenuItems.length; i++) {
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(
            ariaLabelDropdown.walletInfo.preFix + HBDDropdownMenuItems[i].icon,
          ),
        );
      });
      if (
        HBDDropdownMenuItems[i].icon === Icons.ARROW_DOWNWARDS ||
        HBDDropdownMenuItems[i].icon === Icons.ARROW_UPWARDS
      ) {
        expect(
          await screen.findByLabelText(`${Screen.POWER_UP_PAGE}-page`),
        ).toBeInTheDocument();
      } else {
        expect(
          await screen.findByLabelText(
            `${HBDDropdownMenuItems[i].nextScreen}-page`,
          ),
        ).toBeInTheDocument();
      }
      await act(async () => {
        await userEvent.click(screen.getByLabelText(ariaLabelIcon.closePage));
        await userEvent.click(
          screen.getByLabelText(
            ariaLabelDropdown.arrow.preFix +
              CurrencyUtils.getCurrencyLabels(false).hbd.toLowerCase(),
          ),
        );
      });
    }
  });
});
