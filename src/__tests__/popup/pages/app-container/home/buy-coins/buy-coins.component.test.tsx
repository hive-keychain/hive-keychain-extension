import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';
import { Screen } from 'src/reference-data/screen.enum';

describe('buy-coins.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

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
  });

  it('Must open buy coins page from the home action bar', async () => {
    await act(async () => {
      await userEvent.click(
        screen.getByTestId(
          dataTestIdButton.actionBtn.preFix + 'popup_html_buy',
        ),
      );
    });
    expect(
      await screen.findByTestId(`${Screen.BUY_COINS_PAGE}-page`),
    ).toBeInTheDocument();
  });
});
