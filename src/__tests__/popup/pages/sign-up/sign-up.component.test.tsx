import App from '@popup/App';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/rtl-render/rtl-render-functions';
//TODO bellow adjust aria-labels alComponent.signUp -> ariaLabel.signUp
describe('sign-up.component tests:\n', () => {
  beforeEach(async () => {
    await reactTestingLibrary.renderWithConfiguration(
      <App />,
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
    expect(screen.getByLabelText(alComponent.signUp)).toBeInTheDocument();
  });
  it('Must show error message when using different passwords and pressing enter', async () => {
    await act(async () => {
      await userEvent.type(
        screen.getByLabelText('password-input'),
        '@1qEWqw!!',
      );
      await userEvent.type(
        screen.getByLabelText('password-input-confirmation'),
        '@1qEWqw!{enter}',
      );
    });
    expect(
      screen.getByText(chrome.i18n.getMessage('popup_password_mismatch'), {
        exact: true,
      }),
    ).toBeInTheDocument();
  });

  it('Must show error message when using different passwords and clicking button', async () => {
    await act(async () => {
      await userEvent.type(
        screen.getByLabelText('password-input'),
        '@1qEWqw!!',
      );
      await userEvent.type(
        screen.getByLabelText('password-input-confirmation'),
        '@1qEWqw!',
      );
      await userEvent.click(screen.getByLabelText('signup-button'));
    });
    expect(
      screen.getByText(chrome.i18n.getMessage('popup_password_mismatch'), {
        exact: true,
      }),
    ).toBeInTheDocument();
  });

  it('Must show error message when invalid password and pressing enter', async () => {
    await act(async () => {
      await userEvent.type(screen.getByLabelText('password-input'), '1qEWqw');
      await userEvent.type(
        screen.getByLabelText('password-input-confirmation'),
        '1qEWqw{enter}',
      );
    });
    expect(
      screen.getByText(chrome.i18n.getMessage('popup_password_regex'), {
        exact: true,
      }),
    ).toBeInTheDocument();
  });

  it('Must show error message when invalid password and clicking button', async () => {
    await act(async () => {
      await userEvent.type(screen.getByLabelText('password-input'), '1qEWqw');
      await userEvent.type(
        screen.getByLabelText('password-input-confirmation'),
        '1qEWqw',
      );
      await userEvent.click(screen.getByLabelText('signup-button'));
    });
    expect(
      screen.getByText(chrome.i18n.getMessage('popup_password_regex'), {
        exact: true,
      }),
    ).toBeInTheDocument();
  });

  it('Must navigate to add_keys_page with valid password and pressing enter', async () => {
    await act(async () => {
      await userEvent.type(screen.getByLabelText('password-input'), '1qEWqw23');
      await userEvent.type(
        screen.getByLabelText('password-input-confirmation'),
        '1qEWqw23{enter}',
      );
    });
    expect(
      screen.getByLabelText(alComponent.addAccountMain),
    ).toBeInTheDocument();
  });

  it('Must navigate to add_keys_page with valid password and click button', async () => {
    await act(async () => {
      await userEvent.type(screen.getByLabelText('password-input'), '1qEWqw23');
      await userEvent.type(
        screen.getByLabelText('password-input-confirmation'),
        '1qEWqw23',
      );
      await userEvent.click(screen.getByLabelText('signup-button'));
    });
    expect(
      screen.getByLabelText(alComponent.addAccountMain),
    ).toBeInTheDocument();
  });
});
