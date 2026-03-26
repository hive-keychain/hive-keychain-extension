import { Screen } from '@interfaces/screen.interface';
import '@testing-library/jest-dom';
import { act, cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Store } from 'redux';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdCheckbox from 'src/__tests__/utils-for-testing/data-testid/data-testid-checkbox';
import dataTestIdInput from 'src/__tests__/utils-for-testing/data-testid/data-testid-input';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import { LoadingValuesConfiguration } from 'src/__tests__/utils-for-testing/loading-values-configuration/loading-values-configuration';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';
import { RootState } from 'src/popup/multichain/store';
import { SignUpComponent } from 'src/popup/multichain/pages/sign-up/sign-up.component';

/** Sign-up UI lives under ChainRouter when !mk; test the screen directly (not HiveApp). */
describe('sign-up.component tests:\n', () => {
  let store: Store<RootState>;

  beforeEach(async () => {
    LoadingValuesConfiguration.set({
      app: {
        accountsRelated: {
          AccountUtils: {
            hasStoredAccounts: false,
            getAccountsFromLocalStorage: [],
          },
          ActiveAccountUtils: {
            getActiveAccountNameFromLocalStorage: '',
          },
          MkUtils: {
            getMkFromLocalStorage: '',
          },
        },
      },
    });
    const result = customRender(<SignUpComponent />, {
      initialState: initialEmptyStateStore,
    });
    store = result.store;
    await waitFor(() => {});
  });
  afterEach(() => cleanup());

  const acceptTerms = async () => {
    await act(async () => {
      await userEvent.click(
        screen.getByTestId(dataTestIdCheckbox.signUp.acceptTerms),
      );
    });
  };

  it('Must show sign up component', async () => {
    expect(screen.getByTestId('signup-page')).toBeInTheDocument();
  });

  it('Must show error message when using different passwords and pressing enter', async () => {
    await acceptTerms();
    await act(async () => {
      await userEvent.type(
        screen.getByTestId(dataTestIdInput.password),
        '@1qEWqw!!',
      );
      await userEvent.type(
        screen.getByTestId(dataTestIdInput.confirmation),
        '@1qEWqw!{enter}',
      );
    });
    expect(
      await screen.findByText(
        chrome.i18n.getMessage('popup_password_mismatch'),
        { exact: true },
      ),
    ).toBeInTheDocument();
  });

  it('Must show error message when using different passwords and clicking button', async () => {
    await acceptTerms();
    await act(async () => {
      await userEvent.type(
        screen.getByTestId(dataTestIdInput.password),
        '@1qEWqw!!',
      );
      await userEvent.type(
        screen.getByTestId(dataTestIdInput.confirmation),
        '@1qEWqw!',
      );
      await userEvent.click(screen.getByTestId(dataTestIdButton.signUp));
    });
    expect(
      await screen.findByText(
        chrome.i18n.getMessage('popup_password_mismatch'),
        { exact: true },
      ),
    ).toBeInTheDocument();
  });

  it('Must show error message when invalid password and pressing enter', async () => {
    await acceptTerms();
    await act(async () => {
      await userEvent.type(
        screen.getByTestId(dataTestIdInput.password),
        '1qEWqw',
      );
      await userEvent.type(
        screen.getByTestId(dataTestIdInput.confirmation),
        '1qEWqw{enter}',
      );
    });
    expect(
      await screen.findByText(chrome.i18n.getMessage('popup_password_regex'), {
        exact: true,
      }),
    ).toBeInTheDocument();
  });

  it('Must show error message when invalid password and clicking button', async () => {
    await acceptTerms();
    await act(async () => {
      await userEvent.type(
        screen.getByTestId(dataTestIdInput.password),
        '1qEWqw',
      );
      await userEvent.type(
        screen.getByTestId(dataTestIdInput.confirmation),
        '1qEWqw',
      );
      await userEvent.click(screen.getByTestId(dataTestIdButton.signUp));
    });
    expect(
      await screen.findByText(chrome.i18n.getMessage('popup_password_regex'), {
        exact: true,
      }),
    ).toBeInTheDocument();
  });

  it('Must navigate to add_keys_page with valid password and pressing enter', async () => {
    await acceptTerms();
    await act(async () => {
      await userEvent.type(
        screen.getByTestId(dataTestIdInput.password),
        '1qEWqw23',
      );
      await userEvent.type(
        screen.getByTestId(dataTestIdInput.confirmation),
        '1qEWqw23{enter}',
      );
    });
    await waitFor(() => {
      expect(store.getState().navigation.stack[0]?.currentPage).toBe(
        Screen.ACCOUNT_PAGE_INIT_ACCOUNT,
      );
    });
  });

  it('Must navigate to add_keys_page with valid password and click button', async () => {
    await acceptTerms();
    await act(async () => {
      await userEvent.type(
        screen.getByTestId(dataTestIdInput.password),
        '1qEWqw23',
      );
      await userEvent.type(
        screen.getByTestId(dataTestIdInput.confirmation),
        '1qEWqw23',
      );
      await userEvent.click(screen.getByTestId(dataTestIdButton.signUp));
    });
    await waitFor(() => {
      expect(store.getState().navigation.stack[0]?.currentPage).toBe(
        Screen.ACCOUNT_PAGE_INIT_ACCOUNT,
      );
    });
  });
});
