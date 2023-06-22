import { ExtendedAccount } from '@hiveio/dhive';
import { LocalAccount } from '@interfaces/local-account.interface';
import App from '@popup/App';
import { Icons } from '@popup/icons.enum';
import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ariaLabelButton from 'src/__tests__/utils-for-testing/aria-labels/aria-label-button';
import ariaLabelDiv from 'src/__tests__/utils-for-testing/aria-labels/aria-label-div';
import ariaLabelIcon from 'src/__tests__/utils-for-testing/aria-labels/aria-label-icon';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import AccountUtils from 'src/utils/account.utils';
describe('account-keys-list.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  describe('General cases:\n', () => {
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <App />,
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
        await userEvent.click(screen.getByLabelText(ariaLabelButton.menu));
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.menuPreFix + Icons.ACCOUNTS),
        );
        await userEvent.click(
          screen.getByLabelText(
            ariaLabelButton.menuPreFix + Icons.MANAGE_ACCOUNTS,
          ),
        );
      });
    });
    it('Must show selected private key when clicking to show', async () => {
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(
            ariaLabelDiv.keys.list.preFix.clickeableKey + 'posting',
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
          screen.getByLabelText(
            ariaLabelDiv.keys.list.preFix.clickeableKey + 'posting',
          ),
        );
        await userEvent.click(
          screen.getByLabelText(
            ariaLabelDiv.keys.list.preFix.clickeableKey + 'posting',
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
          screen.getByLabelText(
            ariaLabelIcon.keys.list.preFix.remove + 'posting',
          ),
        );
      });
      expect(
        await screen.findByLabelText(`${Screen.CONFIRMATION_PAGE}-page`),
      ).toBeInTheDocument();
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.dialog.cancel),
        );
      });
    });

    it('Must show confirmation to remove account and go back when cancelling', async () => {
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.accounts.manage.delete),
        );
      });
      expect(
        await screen.findByLabelText(`${Screen.CONFIRMATION_PAGE}-page`),
      ).toBeInTheDocument();
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.dialog.cancel),
        );
      });
      expect(
        screen.queryByLabelText(`${Screen.CONFIRMATION_PAGE}-page`),
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
          screen.getByLabelText(ariaLabelButton.accounts.manage.delete),
        );
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.dialog.confirm),
        );
      });
      expect(
        await screen.findByLabelText(`${Screen.HOME_PAGE}-page`),
      ).toBeInTheDocument();
      expect(await screen.findByText(mk.user.two)).toBeInTheDocument();
    });
  });

  describe('Removing key cases:\n', () => {
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <App />,
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
        await userEvent.click(screen.getByLabelText(ariaLabelButton.menu));
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.menuPreFix + Icons.ACCOUNTS),
        );
        await userEvent.click(
          screen.getByLabelText(
            ariaLabelButton.menuPreFix + Icons.MANAGE_ACCOUNTS,
          ),
        );
      });
    });
    it('Must remove active key', async () => {
      expect(
        screen.queryByLabelText(ariaLabelIcon.keys.list.preFix.add + 'posting'),
      ).not.toBeInTheDocument();
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(
            ariaLabelIcon.keys.list.preFix.remove + 'posting',
          ),
        );
      });
      expect(
        await screen.findByLabelText(`${Screen.CONFIRMATION_PAGE}-page`),
      ).toBeInTheDocument();
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.dialog.confirm),
        );
      });
      await act(async () => {
        await userEvent.click(screen.getByLabelText(ariaLabelButton.menu));
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.menuPreFix + Icons.ACCOUNTS),
        );
        await userEvent.click(
          screen.getByLabelText(
            ariaLabelButton.menuPreFix + Icons.MANAGE_ACCOUNTS,
          ),
        );
      });
      expect(
        await screen.findByLabelText(
          ariaLabelIcon.keys.list.preFix.add + 'posting',
        ),
      ).toBeInTheDocument();
    });
  });

  describe('Using authorized account', () => {
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <App />,
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
        await userEvent.click(screen.getByLabelText(ariaLabelButton.menu));
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.menuPreFix + Icons.ACCOUNTS),
        );
        await userEvent.click(
          screen.getByLabelText(
            ariaLabelButton.menuPreFix + Icons.MANAGE_ACCOUNTS,
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
          screen.getByLabelText(ariaLabelDiv.keys.list.usingAuthorized),
        );
      });
      expect(
        await screen.findByLabelText(ariaLabelDiv.selectedAccount),
      ).toHaveTextContent(mk.user.two);
    });
  });
});
