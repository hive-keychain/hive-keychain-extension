import CurrencyUtils from '@hiveapp/utils/currency.utils';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdDropdown from 'src/__tests__/utils-for-testing/data-testid/data-testid-dropdown';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';

//TODO Fix this test

describe('home.component dropdown hp tests:\n', () => {
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
    // for (let i = 0; i < HpDropdownMenuItems.length; i++) {
    //   await act(async () => {
    //     await userEvent.click(
    //       screen.getByTestId(
    //         dataTestIdDropdown.walletInfo.preFix + HpDropdownMenuItems[i].icon,
    //       ),
    //     );
    //   });
    //   if (
    //     HpDropdownMenuItems[i].icon === Icons.ARROW_DOWNWARDS ||
    //     HpDropdownMenuItems[i].icon === Icons.ARROW_UPWARDS
    //   ) {
    //     expect(
    //       await screen.findByTestId(`${Screen.POWER_UP_PAGE}-page`),
    //     ).toBeInTheDocument();
    //   } else {
    //     expect(
    //       await screen.findByTestId(
    //         `${HpDropdownMenuItems[i].nextScreen}-page`,
    //       ),
    //     ).toBeInTheDocument();
    //   }
    //   await act(async () => {
    //     await userEvent.click(screen.getByTestId(dataTestIdIcon.closePage));
    //     await userEvent.click(
    //       screen.getByTestId(
    //         dataTestIdDropdown.arrow.preFix +
    //           CurrencyUtils.getCurrencyLabels(false).hp.toLowerCase(),
    //       ),
    //     );
    //   });
    // }
  });
});
