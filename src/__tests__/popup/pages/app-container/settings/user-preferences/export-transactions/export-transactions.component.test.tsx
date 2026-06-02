import { Screen } from '@interfaces/screen.interface';
import '@testing-library/jest-dom';
import { cleanup, screen } from '@testing-library/react';
import React from 'react';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import { initialStateForHome } from 'src/__tests__/utils-for-testing/initial-states';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';
import * as activeAccountActions from 'src/popup/hive/actions/active-account.actions';
import { ExportTransactionsComponent } from 'src/popup/hive/pages/app-container/settings/user-preferences/export-transactions/export-transactions.component';

describe('export-transactions.component', () => {
  beforeEach(() => {
    chrome.i18n.getMessage = jest.fn((key: string) => key);
  });

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it('renders with a local account selector and does not dispatch loadActiveAccount', () => {
    const loadActiveAccountSpy = jest.spyOn(
      activeAccountActions,
      'loadActiveAccount',
    );

    try {
      customRender(<ExportTransactionsComponent />, {
        initialState: initialStateForHome,
      });

      expect(
        screen.getByTestId(`${Screen.SETTINGS_EXPORT_TRANSACTIONS}-page`),
      ).toBeInTheDocument();
      expect(
        screen.getByText(userData.one.username, { exact: false }),
      ).toBeInTheDocument();
      expect(loadActiveAccountSpy).not.toHaveBeenCalled();
    } finally {
      loadActiveAccountSpy.mockRestore();
    }
  });
});
