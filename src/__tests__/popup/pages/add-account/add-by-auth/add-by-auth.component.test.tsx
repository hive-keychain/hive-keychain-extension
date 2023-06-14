import { ExtendedAccount } from '@hiveio/dhive';
import App from '@popup/App';
import { Icons } from '@popup/icons.enum';
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
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/rtl-render/rtl-render-functions';
import AccountUtils from 'src/utils/account.utils';

describe('add-by-auth tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
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
      await userEvent.click(await screen.findByLabelText(ariaLabelButton.menu));
      await userEvent.click(
        await screen.findByLabelText(
          ariaLabelButton.menuPreFix + Icons.ACCOUNTS,
        ),
      );
      await userEvent.click(
        await screen.findByLabelText(
          ariaLabelButton.menuPreFix + Icons.ADD_ACCOUNT,
        ),
      );
      await userEvent.click(
        await screen.findByLabelText(ariaLabelButton.addByAuth),
      );
    });
  });

  it('Must load add by auth page', async () => {
    expect(
      await screen.findByLabelText(`${Screen.ACCOUNT_PAGE_ADD_BY_AUTH}-page`),
    ).toBeInTheDocument();
  });

  it('Must show error trying to add existing account', async () => {
    await act(async () => {
      await userEvent.type(
        await screen.findByLabelText(ariaLabelInput.username),
        mk.user.one,
      );
      await userEvent.type(
        await screen.findByLabelText(ariaLabelInput.authorizedAccount),
        mk.user.two,
      );
      await userEvent.click(
        await screen.findByLabelText(ariaLabelButton.submit),
      );
    });
    expect(
      await screen.findByText(
        chrome.i18n.getMessage('popup_html_account_already_existing'),
      ),
    ).toBeInTheDocument();
  });

  it('Must show error if empty username', async () => {
    await act(async () => {
      await userEvent.type(
        await screen.findByLabelText(ariaLabelInput.username),
        '{space}',
      );
      await userEvent.type(
        await screen.findByLabelText(ariaLabelInput.authorizedAccount),
        mk.user.two,
      );
      await userEvent.click(
        await screen.findByLabelText(ariaLabelButton.submit),
      );
    });
    expect(
      await screen.findByText(chrome.i18n.getMessage('popup_accounts_fill')),
    ).toBeInTheDocument();
  });

  it('Must show error if empty authorized account', async () => {
    await act(async () => {
      await userEvent.type(
        await screen.findByLabelText(ariaLabelInput.username),
        'aggroed',
      );
      await userEvent.type(
        await screen.findByLabelText(ariaLabelInput.authorizedAccount),
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

  it('Must show error if account not present in local accounts', async () => {
    await act(async () => {
      await userEvent.type(
        await screen.findByLabelText(ariaLabelInput.username),
        'aggroed',
      );
      await userEvent.type(
        await screen.findByLabelText(ariaLabelInput.authorizedAccount),
        'theghost1980',
      );
      await userEvent.click(
        await screen.findByLabelText(ariaLabelButton.submit),
      );
    });
    expect(
      await screen.findByText(
        chrome.i18n.getMessage('popup_no_auth_account', ['theghost1980']),
      ),
    ).toBeInTheDocument();
  });

  it('Must show error if account not found in hive', async () => {
    AccountUtils.getAccount = jest.fn().mockResolvedValue([]);
    await act(async () => {
      await userEvent.type(
        await screen.findByLabelText(ariaLabelInput.username),
        'notFoundInHive',
      );
      await userEvent.type(
        await screen.findByLabelText(ariaLabelInput.authorizedAccount),
        mk.user.one,
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

  it('Must show error if account is not authorized', async () => {
    const cloneExtendedAccount = objects.clone(
      accounts.asArray.extended,
    ) as ExtendedAccount[];
    cloneExtendedAccount[0].posting.account_auths = [];
    AccountUtils.getAccount = jest.fn().mockResolvedValue(cloneExtendedAccount);
    await act(async () => {
      await userEvent.type(
        await screen.findByLabelText(ariaLabelInput.username),
        'theghost1980',
      );
      await userEvent.type(
        await screen.findByLabelText(ariaLabelInput.authorizedAccount),
        mk.user.one,
      );
      await userEvent.click(
        await screen.findByLabelText(ariaLabelButton.submit),
      );
    });
    expect(
      await screen.findByText(
        chrome.i18n.getMessage('popup_accounts_no_auth', [
          mk.user.one,
          'theghost1980',
        ]),
      ),
    ).toBeInTheDocument();
  });

  it('Must add account auth and navigate to settings main page', async () => {
    const cloneExtendedAccount = objects.clone(
      accounts.asArray.extended,
    ) as ExtendedAccount[];
    cloneExtendedAccount[0].posting.account_auths = [[mk.user.one, 1]];
    AccountUtils.getAccount = jest.fn().mockResolvedValue(cloneExtendedAccount);
    await act(async () => {
      await userEvent.type(
        await screen.findByLabelText(ariaLabelInput.username),
        'theghost1980',
      );
      await userEvent.type(
        await screen.findByLabelText(ariaLabelInput.authorizedAccount),
        mk.user.one,
      );
      await userEvent.click(
        await screen.findByLabelText(ariaLabelButton.submit),
      );
    });
    expect(
      await screen.findByLabelText(`${Screen.SETTINGS_MAIN_PAGE}-page`),
    ).toBeInTheDocument();
  });
});
