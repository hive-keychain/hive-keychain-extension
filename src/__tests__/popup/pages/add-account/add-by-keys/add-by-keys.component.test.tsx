import App from '@popup/App';
import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ariaLabelButton from 'src/__tests__/utils-for-testing/aria-labels/aria-label-button';
import ariaLabelInput from 'src/__tests__/utils-for-testing/aria-labels/aria-label-input';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import AccountUtils from 'src/utils/account.utils';

describe('add-by-keys:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
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
    await act(async () => {
      await userEvent.click(
        await screen.findByLabelText(ariaLabelButton.addByKeys),
      );
    });
  });

  it('Must add valid posting key and load home page', async () => {
    AccountUtils.getAccount = jest
      .fn()
      .mockResolvedValue(accounts.asArray.extended);
    AccountUtils.hasStoredAccounts = jest.fn().mockResolvedValue(true);
    await act(async () => {
      await userEvent.type(
        await screen.findByLabelText(ariaLabelInput.username),
        mk.user.one,
      );
      await userEvent.type(
        await screen.findByLabelText(ariaLabelInput.privateKey),
        userData.one.nonEncryptKeys.posting,
      );
      await userEvent.click(
        await screen.findByLabelText(ariaLabelButton.submit),
      );
    });
    expect(
      await screen.findByLabelText(`${Screen.HOME_PAGE}-page`),
    ).toBeInTheDocument();
  });

  it('Must add valid memo key and load homepage', async () => {
    AccountUtils.getAccount = jest
      .fn()
      .mockResolvedValue(accounts.asArray.extended);
    AccountUtils.hasStoredAccounts = jest.fn().mockResolvedValue(true);
    await act(async () => {
      await userEvent.type(
        await screen.findByLabelText(ariaLabelInput.username),
        mk.user.one,
      );
      await userEvent.type(
        await screen.findByLabelText(ariaLabelInput.privateKey),
        userData.one.nonEncryptKeys.memo,
      );
      await userEvent.click(
        await screen.findByLabelText(ariaLabelButton.submit),
      );
    });
    expect(
      await screen.findByLabelText(`${Screen.HOME_PAGE}-page`),
    ).toBeInTheDocument();
  });

  it('Must add valid active key and load homepage', async () => {
    AccountUtils.getAccount = jest
      .fn()
      .mockResolvedValue(accounts.asArray.extended);
    AccountUtils.hasStoredAccounts = jest.fn().mockResolvedValue(true);
    await act(async () => {
      await userEvent.type(
        await screen.findByLabelText(ariaLabelInput.username),
        mk.user.one,
      );
      await userEvent.type(
        await screen.findByLabelText(ariaLabelInput.privateKey),
        userData.one.nonEncryptKeys.active,
      );
      await userEvent.click(
        await screen.findByLabelText(ariaLabelButton.submit),
      );
    });
    expect(
      await screen.findByLabelText(`${Screen.HOME_PAGE}-page`),
    ).toBeInTheDocument();
  });
  it('Must derivate all keys from master, and navigate to select keys page', async () => {
    AccountUtils.getAccount = jest
      .fn()
      .mockResolvedValue(accounts.asArray.extended);
    await act(async () => {
      await userEvent.type(
        await screen.findByLabelText(ariaLabelInput.username),
        mk.user.one,
      );
      await userEvent.type(
        await screen.findByLabelText(ariaLabelInput.privateKey),
        userData.one.nonEncryptKeys.master,
      );
      await userEvent.click(
        await screen.findByLabelText(ariaLabelButton.submit),
      );
    });
    expect(
      await screen.findByLabelText(`${Screen.ACCOUNT_PAGE_SELECT_KEYS}-page`),
    ).toBeInTheDocument();
  });

  it('Must show error if not found username', async () => {
    AccountUtils.getAccount = jest.fn().mockResolvedValue([]);
    await act(async () => {
      await userEvent.type(
        await screen.findByLabelText(ariaLabelInput.username),
        'non_existent_user',
      );
      await userEvent.type(
        await screen.findByLabelText(ariaLabelInput.privateKey),
        userData.one.nonEncryptKeys.master,
      );
      await userEvent.click(
        await screen.findByLabelText(ariaLabelButton.submit),
      );
    });
    expect(
      await screen.findByText(
        chrome.i18n.getMessage('popup_accounts_incorrect_user'),
      ),
    ).toBeInTheDocument();
  });

  it('Must show error if empty password', async () => {
    await act(async () => {
      await userEvent.type(
        await screen.findByLabelText(ariaLabelInput.username),
        mk.user.one,
      );
      await userEvent.type(
        await screen.findByLabelText(ariaLabelInput.privateKey),
        '{space}',
      );
      await userEvent.click(
        await screen.findByLabelText(ariaLabelButton.submit),
      );
    });
    expect(
      await screen.findByText(chrome.i18n.getMessage('popup_accounts_fill')),
    ).toBeInTheDocument();
  });

  it('Must show error when using a public key', async () => {
    await act(async () => {
      await userEvent.type(
        await screen.findByLabelText(ariaLabelInput.username),
        mk.user.one,
      );
      await userEvent.type(
        await screen.findByLabelText(ariaLabelInput.privateKey),
        userData.one.encryptKeys.active,
      );
      await userEvent.click(
        await screen.findByLabelText(ariaLabelButton.submit),
      );
    });
    expect(
      await screen.findByText(
        chrome.i18n.getMessage('popup_account_password_is_public_key'),
      ),
    ).toBeInTheDocument();
  });

  it('Must show error when using an incorrect key', async () => {
    await act(async () => {
      await userEvent.type(
        await screen.findByLabelText(ariaLabelInput.username),
        mk.user.one,
      );
      await userEvent.type(
        await screen.findByLabelText(ariaLabelInput.privateKey),
        userData.one.encryptKeys.randomString53,
      );
      await userEvent.click(
        await screen.findByLabelText(ariaLabelButton.submit),
      );
    });
    expect(
      await screen.findByText(
        chrome.i18n.getMessage('popup_accounts_incorrect_key'),
      ),
    ).toBeInTheDocument();
  });
});
