import App from '@popup/App';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ariaLabelButton from 'src/__tests__/utils-for-testing/aria-labels/aria-label-button';
import ariaLabelIcon from 'src/__tests__/utils-for-testing/aria-labels/aria-label-icon';
import ariaLabelLink from 'src/__tests__/utils-for-testing/aria-labels/aria-label-link';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/rtl-render/rtl-render-functions';
import AccountUtils from 'src/utils/account.utils';
import MkUtils from 'src/utils/mk.utils';
describe('reset-password.component tests:\n', () => {
  beforeEach(async () => {
    await reactTestingLibrary.renderWithConfiguration(
      <App />,
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
      await userEvent.click(screen.getByLabelText(ariaLabelLink.resetPassword));
      await userEvent.click(
        screen.getByLabelText(ariaLabelButton.confirmResetPassword),
      );
    });
    screen.debug();
    expect(await screen.findByLabelText('signup-page')).toBeInTheDocument();
  });
  it('Must cancel and return to previous window', async () => {
    await act(async () => {
      await userEvent.click(screen.getByLabelText(ariaLabelLink.resetPassword));
    });
    expect(
      await screen.findByLabelText(ariaLabelButton.confirmResetPassword),
    ).toBeInTheDocument();
    await act(async () => {
      await userEvent.click(screen.getByLabelText(ariaLabelIcon.arrowBack));
    });
    expect(
      screen.queryByLabelText(ariaLabelButton.confirmResetPassword),
    ).not.toBeInTheDocument();
  });
});
