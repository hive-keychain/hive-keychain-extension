import { LocalAccount } from '@interfaces/local-account.interface';
import App from '@popup/App';
import { Icons } from '@popup/icons.enum';
import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdIcon from 'src/__tests__/utils-for-testing/data-testid/data-testid-icon';
import dataTestIdInput from 'src/__tests__/utils-for-testing/data-testid/data-testid-input';
import dataTestIdParagraph from 'src/__tests__/utils-for-testing/data-testid/data-testid-paragraph';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import manipulateStrings from 'src/__tests__/utils-for-testing/helpers/manipulate-strings';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import AccountUtils from 'src/utils/account.utils';
describe('add-key.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  beforeEach(async () => {
    const clonedLocalAccount = objects.clone(
      accounts.local.justTwoKeys,
    ) as LocalAccount;
    delete clonedLocalAccount.keys.active;
    delete clonedLocalAccount.keys.activePubkey;
    await reactTestingLibrary.renderWithConfiguration(
      <App />,
      initialStates.iniStateAs.defaultExistent,
      {
        app: {
          accountsRelated: {
            AccountUtils: {
              getAccountsFromLocalStorage: [clonedLocalAccount],
            },
          },
        },
      },
    );
    await act(async () => {
      await userEvent.click(screen.getByLabelText(dataTestIdButton.menu));
      await userEvent.click(
        screen.getByLabelText(dataTestIdButton.menuPreFix + Icons.ACCOUNTS),
      );
      await userEvent.click(
        screen.getByLabelText(
          dataTestIdButton.menuPreFix + Icons.MANAGE_ACCOUNTS,
        ),
      );
    });
  });

  it('Must show add keys buttons', async () => {
    expect(await screen.findAllByText(`${Icons.ADD_CIRCLE}`)).toHaveLength(2);
  });

  it('Must show add keys page and message', async () => {
    await act(async () => {
      await userEvent.click(
        screen.getByLabelText(dataTestIdIcon.keys.list.preFix.add + 'active'),
      );
    });
    expect(
      screen.getByLabelText(`${Screen.SETTINGS_ADD_KEY}-page`),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(dataTestIdParagraph.add.keyPage.introduction),
    ).toHaveTextContent(
      manipulateStrings.removeHtmlTags(
        chrome.i18n.getMessage('popup_html_add_key_text', ['Active']),
      ),
    );
  });

  describe('Hitting enter:/n', () => {
    it('Must show error if empty active key', async () => {
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(dataTestIdIcon.keys.list.preFix.add + 'active'),
        );
        await userEvent.type(
          screen.getByLabelText(dataTestIdInput.privateKey),
          '{enter}',
        );
      });
      expect(
        await screen.findByText(chrome.i18n.getMessage('popup_accounts_fill')),
      );
    });
    it('Must add active key', async () => {
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(dataTestIdIcon.keys.list.preFix.add + 'active'),
        );
        await userEvent.type(
          screen.getByLabelText(dataTestIdInput.privateKey),
          `${userData.one.nonEncryptKeys.active}{enter}`,
        );
      });
      expect(
        await screen.findByText(userData.one.encryptKeys.active),
      ).toBeInTheDocument();
    });

    it('Must add memo key', async () => {
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(dataTestIdIcon.keys.list.preFix.add + 'memo'),
        );
        await userEvent.type(
          screen.getByLabelText(dataTestIdInput.privateKey),
          `${userData.one.nonEncryptKeys.memo}{enter}`,
        );
      });
      expect(
        await screen.findByText(userData.one.encryptKeys.memo),
      ).toBeInTheDocument();
    });

    describe('Using master:\n', () => {
      it('Must add memo keys using master password', async () => {
        await act(async () => {
          await userEvent.click(
            screen.getByLabelText(dataTestIdIcon.keys.list.preFix.add + 'memo'),
          );
          await userEvent.type(
            screen.getByLabelText(dataTestIdInput.privateKey),
            `${userData.one.nonEncryptKeys.master}{enter}`,
          );
        });
        expect(
          await screen.findByText(userData.one.encryptKeys.memo),
        ).toBeInTheDocument();
      });

      it('Must add active key using master password', async () => {
        await act(async () => {
          await userEvent.click(
            screen.getByLabelText(
              dataTestIdIcon.keys.list.preFix.add + 'active',
            ),
          );
          await userEvent.type(
            screen.getByLabelText(dataTestIdInput.privateKey),
            `${userData.one.nonEncryptKeys.master}{enter}`,
          );
        });
        expect(
          await screen.findByText(userData.one.encryptKeys.active),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Clicking import:\n', () => {
    it('Must show error if empty key', async () => {
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(dataTestIdIcon.keys.list.preFix.add + 'active'),
        );
        await userEvent.type(
          screen.getByLabelText(dataTestIdInput.privateKey),
          '{space}',
        );
        await userEvent.click(
          screen.getByLabelText(dataTestIdButton.importKeys),
        );
      });
      expect(
        await screen.findByText(chrome.i18n.getMessage('popup_accounts_fill')),
      );
    });

    it('Must add active key', async () => {
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(dataTestIdIcon.keys.list.preFix.add + 'active'),
        );
        await userEvent.type(
          screen.getByLabelText(dataTestIdInput.privateKey),
          `${userData.one.nonEncryptKeys.active}`,
        );
        await userEvent.click(
          screen.getByLabelText(dataTestIdButton.importKeys),
        );
      });
      expect(
        await screen.findByText(userData.one.encryptKeys.active),
      ).toBeInTheDocument();
    });

    describe('Using master:\n', () => {
      it('Must add memo key using master password', async () => {
        await act(async () => {
          await userEvent.click(
            screen.getByLabelText(
              dataTestIdIcon.keys.list.preFix.add + 'active',
            ),
          );
          await userEvent.type(
            screen.getByLabelText(dataTestIdInput.privateKey),
            `${userData.one.nonEncryptKeys.master}`,
          );
          await userEvent.click(
            screen.getByLabelText(dataTestIdButton.importKeys),
          );
        });
        expect(
          await screen.findByText(userData.one.encryptKeys.active),
        ).toBeInTheDocument();
      });
    });

    describe('Error cases:\n', () => {
      it('Must show error if using active public key', async () => {
        await act(async () => {
          await userEvent.click(
            screen.getByLabelText(
              dataTestIdIcon.keys.list.preFix.add + 'active',
            ),
          );
          await userEvent.type(
            screen.getByLabelText(dataTestIdInput.privateKey),
            `${userData.one.encryptKeys.active}`,
          );
          await userEvent.click(
            screen.getByLabelText(dataTestIdButton.importKeys),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('popup_account_password_is_public_key'),
          ),
        );
      });
      it('Must show error if user not found', async () => {
        AccountUtils.getAccount = jest.fn().mockResolvedValue([]);
        await act(async () => {
          await userEvent.click(
            screen.getByLabelText(
              dataTestIdIcon.keys.list.preFix.add + 'active',
            ),
          );
          await userEvent.type(
            screen.getByLabelText(dataTestIdInput.privateKey),
            `${userData.one.nonEncryptKeys.active}`,
          );
          await userEvent.click(
            screen.getByLabelText(dataTestIdButton.importKeys),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('popup_accounts_incorrect_user'),
          ),
        );
      });
      it('Must show error if not valid master password', async () => {
        await act(async () => {
          await userEvent.click(
            screen.getByLabelText(
              dataTestIdIcon.keys.list.preFix.add + 'active',
            ),
          );
          await userEvent.type(
            screen.getByLabelText(dataTestIdInput.privateKey),
            `${userData.one.nonEncryptKeys.randomStringKey51}`,
          );
          await userEvent.click(
            screen.getByLabelText(dataTestIdButton.importKeys),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('popup_accounts_incorrect_key'),
          ),
        );
      });
    });
  });
});
