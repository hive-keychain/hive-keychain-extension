import AccountUtils from '@hiveapp/utils/account.utils';
import { ExtendedAccount } from '@hiveio/dhive';
import { LocalAccount } from '@interfaces/local-account.interface';
import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdDiv from 'src/__tests__/utils-for-testing/data-testid/data-testid-div';
import dataTestIdIcon from 'src/__tests__/utils-for-testing/data-testid/data-testid-icon';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { Icons } from 'src/common-ui/icons.enum';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';
describe('account-keys-list.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  describe('General cases:\n', () => {
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <HiveAppComponent />,
        initialStates.iniStateAs.defaultExistent,
        {
          app: {
            accountsRelated: {
              AccountUtils: {
                getAccountsFromLocalStorage: [
                  accounts.local.oneAllkeys,
                  accounts.local.two,
                ],
              },
            },
          },
        },
      );
      await act(async () => {
        await userEvent.click(screen.getByTestId(dataTestIdButton.menu));
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.menuPreFix + Icons.ACCOUNTS),
        );
        await userEvent.click(
          screen.getByTestId(
            dataTestIdButton.menuPreFix + Icons.MANAGE_ACCOUNTS,
          ),
        );
      });
    });
    it('Must show selected private key when clicking to show', async () => {
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(
            dataTestIdDiv.keys.list.preFix.clickeableKey + 'posting',
          ),
        );
      });
      expect(
        await screen.findByText(userData.one.nonEncryptKeys.posting),
      ).toBeInTheDocument();
    });

    it('Must copy selected private key to clipboard', async () => {
      const originalNavigator = navigator;
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: jest.fn(),
        },
      });
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(
            dataTestIdDiv.keys.list.preFix.clickeableKey + 'posting',
          ),
        );
        await userEvent.click(
          screen.getByTestId(
            dataTestIdDiv.keys.list.preFix.clickeableKey + 'posting',
          ),
        );
      });
      expect(
        await screen.findByText(chrome.i18n.getMessage('popup_html_copied')),
      ).toBeInTheDocument();
      navigator = originalNavigator;
    });

    it('Must show confirmation page when removing key and go back', async () => {
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(
            dataTestIdIcon.keys.list.preFix.remove + 'posting',
          ),
        );
      });
      expect(
        await screen.findByTestId(`${Screen.CONFIRMATION_PAGE}-page`),
      ).toBeInTheDocument();
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.dialog.cancel),
        );
      });
    });

    it('Must show confirmation to remove account and go back when cancelling', async () => {
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.accounts.manage.delete),
        );
      });
      expect(
        await screen.findByTestId(`${Screen.CONFIRMATION_PAGE}-page`),
      ).toBeInTheDocument();
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.dialog.cancel),
        );
      });
      expect(
        screen.queryByTestId(`${Screen.CONFIRMATION_PAGE}-page`),
      ).not.toBeInTheDocument();
    });

    it('Must remove from keychain, navigate to homepage, load remaining account', async () => {
      AccountUtils.getAccount = jest.fn().mockResolvedValue([
        {
          ...accounts.extended,
          name: mk.user.two,
        } as ExtendedAccount,
      ]);
      AccountUtils.deleteAccount = jest
        .fn()
        .mockReturnValue([accounts.local.two] as LocalAccount[]);
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.accounts.manage.delete),
        );
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.dialog.confirm),
        );
      });
      expect(
        await screen.findByTestId(`${Screen.HOME_PAGE}-page`),
      ).toBeInTheDocument();
      expect(await screen.findByText(mk.user.two)).toBeInTheDocument();
    });
  });

  describe('Removing key cases:\n', () => {
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <HiveAppComponent />,
        initialStates.iniStateAs.defaultExistent,
        {
          app: {
            accountsRelated: {
              AccountUtils: {
                getAccountsFromLocalStorage: [
                  accounts.local.oneAllkeys,
                  accounts.local.two,
                ],
              },
            },
          },
        },
      );
      await act(async () => {
        await userEvent.click(screen.getByTestId(dataTestIdButton.menu));
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.menuPreFix + Icons.ACCOUNTS),
        );
        await userEvent.click(
          screen.getByTestId(
            dataTestIdButton.menuPreFix + Icons.MANAGE_ACCOUNTS,
          ),
        );
      });
    });
    it('Must remove active key', async () => {
      expect(
        screen.queryByTestId(dataTestIdIcon.keys.list.preFix.add + 'posting'),
      ).not.toBeInTheDocument();
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(
            dataTestIdIcon.keys.list.preFix.remove + 'posting',
          ),
        );
      });
      expect(
        await screen.findByTestId(`${Screen.CONFIRMATION_PAGE}-page`),
      ).toBeInTheDocument();
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.dialog.confirm),
        );
      });
      await act(async () => {
        await userEvent.click(screen.getByTestId(dataTestIdButton.menu));
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.menuPreFix + Icons.ACCOUNTS),
        );
        await userEvent.click(
          screen.getByTestId(
            dataTestIdButton.menuPreFix + Icons.MANAGE_ACCOUNTS,
          ),
        );
      });
      expect(
        await screen.findByTestId(
          dataTestIdIcon.keys.list.preFix.add + 'posting',
        ),
      ).toBeInTheDocument();
    });
  });

  describe('Using authorized account', () => {
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <HiveAppComponent />,
        initialStates.iniStateAs.defaultExistent,
        {
          app: {
            accountsRelated: {
              AccountUtils: {
                getAccountsFromLocalStorage: [
                  {
                    ...accounts.local.oneAllkeys,
                    keys: {
                      ...accounts.local.oneAllkeys.keys,
                      postingPubkey: `@${mk.user.two}`,
                    },
                  },
                  accounts.local.two,
                ],
              },
            },
          },
        },
      );
      await act(async () => {
        await userEvent.click(screen.getByTestId(dataTestIdButton.menu));
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.menuPreFix + Icons.ACCOUNTS),
        );
        await userEvent.click(
          screen.getByTestId(
            dataTestIdButton.menuPreFix + Icons.MANAGE_ACCOUNTS,
          ),
        );
      });
    });

    it('Must show using authorized account message', () => {
      expect(
        screen.getByText(
          chrome.i18n.getMessage('html_popup_using_authorized_account', [
            `@${mk.user.two}`,
          ]),
        ),
      ).toBeInTheDocument();
    });

    it('Must load authorizated account', async () => {
      AccountUtils.getAccount = jest.fn().mockResolvedValue([
        {
          ...accounts.extended,
          name: mk.user.two,
        } as ExtendedAccount,
      ]);
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(dataTestIdDiv.keys.list.usingAuthorized),
        );
      });
      expect(
        await screen.findByTestId(dataTestIdDiv.selectedAccount),
      ).toHaveTextContent(mk.user.two);
    });
  });
});
