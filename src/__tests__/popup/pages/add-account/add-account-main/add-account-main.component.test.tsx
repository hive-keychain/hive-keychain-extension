import App from '@popup/App';
import { Icons } from '@popup/icons.enum';
import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';

describe('add-account-main.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });

  describe('No Accounts cases: ', () => {
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <App />,
        { ...initialStates.iniStateAs.defaultExistent, accounts: [] },
        {
          app: {
            accountsRelated: {
              AccountUtils: {
                hasStoredAccounts: false,
              },
            },
          },
        },
      );
    });

    it('Must show add account main page', async () => {
      expect(
        await screen.findByLabelText(
          `${Screen.ACCOUNT_PAGE_INIT_ACCOUNT}-page`,
        ),
      ).toBeInTheDocument();
    });

    it('Must navigate to add-by-keys', async () => {
      await act(async () => {
        await userEvent.click(
          await screen.findByLabelText(dataTestIdButton.addByKeys),
        );
      });
      expect(
        await screen.findByLabelText(`${Screen.ACCOUNT_PAGE_ADD_BY_KEYS}-page`),
      ).toBeInTheDocument();
    });
  });

  describe('Accounts cases', () => {
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <App />,
        {
          ...initialStates.iniStateAs.defaultExistent,
          accounts: accounts.twoAccounts,
        },
        {
          app: {
            accountsRelated: {
              AccountUtils: {
                hasStoredAccounts: true,
              },
            },
          },
        },
      );
      await act(async () => {
        await userEvent.click(
          await screen.findByLabelText(dataTestIdButton.menu),
        );
        await userEvent.click(
          await screen.findByLabelText(
            dataTestIdButton.menuPreFix + Icons.ACCOUNTS,
          ),
        );
        await userEvent.click(
          await screen.findByLabelText(
            dataTestIdButton.menuPreFix + Icons.ADD_ACCOUNT,
          ),
        );
      });
    });

    it('Must navigate to add-by-auth', async () => {
      await act(async () => {
        await userEvent.click(
          await screen.findByLabelText(dataTestIdButton.addByAuth),
        );
      });
      expect(
        await screen.findByLabelText(`${Screen.ACCOUNT_PAGE_ADD_BY_AUTH}-page`),
      ).toBeInTheDocument();
    });
  });
});
