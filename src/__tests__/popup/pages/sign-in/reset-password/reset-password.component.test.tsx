import AccountUtils from '@hiveapp/utils/account.utils';
import MkUtils from '@hiveapp/utils/mk.utils';
import { Screen } from '@interfaces/screen.interface';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Store } from 'redux';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdIcon from 'src/__tests__/utils-for-testing/data-testid/data-testid-icon';
import dataTestIdLink from 'src/__tests__/utils-for-testing/data-testid/data-testid-link';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';
import { RootState } from 'src/popup/multichain/store';

describe('reset-password.component tests:\n', () => {
  let store: Store<RootState>;

  beforeEach(async () => {
    store = await reactTestingLibrary.renderWithConfiguration(
      <HiveAppComponent />,
      initialStates.iniStateAs.emptyState,
      {
        app: {
          accountsRelated: {
            MkUtils: {
              getMkFromLocalStorage: '',
            },
            ActiveAccountUtils: {
              getActiveAccountNameFromLocalStorage: '',
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
  it('Must clear all user data and navigate to sign up page', async () => {
    AccountUtils.getAccount = jest.fn().mockResolvedValue([]);
    AccountUtils.getAccountsFromLocalStorage = jest.fn().mockResolvedValue([]);
    MkUtils.getMkFromLocalStorage = jest.fn().mockResolvedValue('');
    AccountUtils.hasStoredAccounts = jest.fn().mockResolvedValue(false);

    await act(async () => {
      await userEvent.click(screen.getByTestId(dataTestIdLink.resetPassword));
      await userEvent.click(
        screen.getByTestId(dataTestIdButton.confirmResetPassword),
      );
    });
    expect(store.getState().navigation.stack[0]?.currentPage).toBe(
      Screen.SIGN_UP_PAGE,
    );
  });
  it('Must cancel and return to previous window', async () => {
    await act(async () => {
      await userEvent.click(screen.getByTestId(dataTestIdLink.resetPassword));
    });
    expect(
      await screen.findByTestId(dataTestIdButton.confirmResetPassword),
    ).toBeInTheDocument();
    await act(async () => {
      await userEvent.click(screen.getByTestId(dataTestIdIcon.arrowBack));
    });
    expect(
      screen.queryByTestId(dataTestIdButton.confirmResetPassword),
    ).not.toBeInTheDocument();
  });
});
