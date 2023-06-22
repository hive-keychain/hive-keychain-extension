import App from '@popup/App';
import { ActionButtonList } from '@popup/pages/app-container/home/actions-section/action-button.list';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdIcon from 'src/__tests__/utils-for-testing/data-testid/data-testid-icon';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';

describe('home.component action-buttons tests:\n', () => {
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
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  it('Must open each page on each action button', async () => {
    for (let i = 0; i < ActionButtonList.length; i++) {
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(
            dataTestIdButton.actionBtn.preFix + ActionButtonList[i].icon,
          ),
        );
      });
      expect(
        await screen.findByTestId(`${ActionButtonList[i].nextScreen}-page`),
      ).toBeInTheDocument();
      await act(async () => {
        await userEvent.click(screen.getByTestId(dataTestIdIcon.arrowBack));
      });
    }
  });
});
