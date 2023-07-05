import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdInput from 'src/__tests__/utils-for-testing/data-testid/data-testid-input';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { HiveAppComponent } from 'src/multichain-container/hive/hive-app.component';

describe('sign-up.component tests:\n', () => {
  beforeEach(async () => {
    await reactTestingLibrary.renderWithConfiguration(
      <HiveAppComponent />,
      initialEmptyStateStore,
      {
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
      },
    );
  });
  afterEach(() => cleanup());

  it('Must show sign up component', async () => {
    expect(screen.getByTestId('signup-page')).toBeInTheDocument();
  });

  it('Must show error message when using different passwords and pressing enter', async () => {
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
    expect(
      await screen.findByTestId(`${Screen.ACCOUNT_PAGE_INIT_ACCOUNT}-page`),
    ).toBeInTheDocument();
  });

  it('Must navigate to add_keys_page with valid password and click button', async () => {
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
    expect(
      await screen.findByTestId(`${Screen.ACCOUNT_PAGE_INIT_ACCOUNT}-page`),
    ).toBeInTheDocument();
  });
});
