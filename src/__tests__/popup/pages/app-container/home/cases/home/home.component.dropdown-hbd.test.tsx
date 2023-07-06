import CurrencyUtils from '@hiveapp/utils/currency.utils';
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
import { Icons } from 'src/common-ui/icons.enum';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';
import { HBDDropdownMenuItems } from 'src/popup/hive/pages/app-container/home/wallet-info-section/wallet-info-dropdown-menus.list';

describe('home.component dropdown hbd tests:\n', () => {
  beforeEach(async () => {
    await reactTestingLibrary.renderWithConfiguration(
      <HiveAppComponent />,
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
          screen.getByTestId(
            dataTestIdDropdown.walletInfo.preFix + HBDDropdownMenuItems[i].icon,
          ),
        );
      });
      if (
        HBDDropdownMenuItems[i].icon === Icons.ARROW_DOWNWARDS ||
        HBDDropdownMenuItems[i].icon === Icons.ARROW_UPWARDS
      ) {
        expect(
          await screen.findByTestId(`${Screen.POWER_UP_PAGE}-page`),
        ).toBeInTheDocument();
      } else {
        expect(
          await screen.findByTestId(
            `${HBDDropdownMenuItems[i].nextScreen}-page`,
          ),
        ).toBeInTheDocument();
      }
      await act(async () => {
        await userEvent.click(screen.getByTestId(dataTestIdIcon.closePage));
        await userEvent.click(
          screen.getByTestId(
            dataTestIdDropdown.arrow.preFix +
              CurrencyUtils.getCurrencyLabels(false).hbd.toLowerCase(),
          ),
        );
      });
    }
  });
});
