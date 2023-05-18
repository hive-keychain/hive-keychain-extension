import { LocalAccount } from '@interfaces/local-account.interface';
import App from '@popup/App';
import { Icons } from '@popup/icons.enum';
import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ariaLabelButton from 'src/__tests__/utils-for-testing/aria-labels/aria-label-button';
import ariaLabelIcon from 'src/__tests__/utils-for-testing/aria-labels/aria-label-icon';
import ariaLabelParagraph from 'src/__tests__/utils-for-testing/aria-labels/aria-label-paragraph';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import manipulateStrings from 'src/__tests__/utils-for-testing/helpers/manipulate-strings';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/rtl-render/rtl-render-functions';
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

  it('Must show add keys buttons', async () => {
    expect(await screen.findAllByText(`${Icons.ADD_CIRCLE}`)).toHaveLength(2);
  });

  it('Must show add keys page and message', async () => {
    await act(async () => {
      await userEvent.click(
        screen.getByLabelText(ariaLabelIcon.keys.list.preFix.add + 'active'),
      );
    });
    expect(
      screen.getByLabelText(`${Screen.SETTINGS_ADD_KEY}-page`),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(ariaLabelParagraph.add.keyPage.introduction),
    ).toHaveTextContent(
      manipulateStrings.removeHtmlTags(
        chrome.i18n.getMessage('popup_html_add_key_text', ['Active']),
      ),
    );
  });

  //TODO continue from here. SR

  // describe('Hitting enter:/n', () => {
  //   it('Must show error if empty key', async () => {
  //     await methods.clickNType('popup_html_active', ' {enter}');
  //     await methods.asserByText(message.addKey.missingFields);
  //   });
  //   it('Must add active key', async () => {
  //     await methods.clickNType(
  //       'popup_html_active',
  //       userData.one.nonEncryptKeys.active + '{enter}',
  //     );
  //     await methods.asserByText(userData.one.encryptKeys.active);
  //   });
  //   it('Must add memo key', async () => {
  //     await methods.clickNType(
  //       'popup_html_memo',
  //       userData.one.nonEncryptKeys.memo + '{enter}',
  //     );
  //     await assertion.awaitFor(userData.one.encryptKeys.memo, QueryDOM.BYTEXT);
  //   });
  //   describe('Using master:\n', () => {
  //     it('Must add active key using master password', async () => {
  //       await methods.clickNType(
  //         'popup_html_active',
  //         userData.one.nonEncryptKeys.master + '{enter}',
  //       );
  //       await methods.asserByText(userData.one.encryptKeys.active);
  //     });
  //     it('Must add memo key using master password', async () => {
  //       await methods.clickNType(
  //         'popup_html_memo',
  //         userData.one.nonEncryptKeys.master + '{enter}',
  //       );
  //       await methods.asserByText(userData.one.encryptKeys.memo);
  //     });
  //   });
  // });

  // describe('Clicking import:\n', () => {
  //   it('Must show error if empty key', async () => {
  //     await methods.clickNType('popup_html_active', '{space}', true);
  //     await methods.asserByText(message.addKey.missingFields);
  //   });
  //   it('Must add active key', async () => {
  //     await methods.clickNType(
  //       'popup_html_active',
  //       userData.one.nonEncryptKeys.active,
  //       true,
  //     );
  //     await methods.asserByText(userData.one.encryptKeys.active);
  //   });
  //   it('Must add memo key', async () => {
  //     await methods.clickNType(
  //       'popup_html_memo',
  //       userData.one.nonEncryptKeys.memo,
  //       true,
  //     );
  //     await assertion.awaitFor(userData.one.encryptKeys.memo, QueryDOM.BYTEXT);
  //   });
  //   describe('Using master:\n', () => {
  //     it('Must add active key using master password', async () => {
  //       await methods.clickNType(
  //         'popup_html_active',
  //         userData.one.nonEncryptKeys.master,
  //         true,
  //       );
  //       await methods.asserByText(userData.one.encryptKeys.active);
  //     });
  //     it('Must add memo key using master password', async () => {
  //       await methods.clickNType(
  //         'popup_html_memo',
  //         userData.one.nonEncryptKeys.master,
  //         true,
  //       );
  //       await methods.asserByText(userData.one.encryptKeys.memo);
  //     });
  //   });
  //   describe('Error cases:\n', () => {
  //     it('Must show error if using public key', async () => {
  //       await methods.clickNType(
  //         'popup_html_active',
  //         userData.one.encryptKeys.active,
  //         true,
  //       );
  //       await methods.asserByText(message.addKey.isPublicKey);
  //     });
  //     it('Must show error if user not found', async () => {
  //       extraMocks.getAccount([]);
  //       await methods.clickNType(
  //         'popup_html_active',
  //         userData.one.nonEncryptKeys.active,
  //         true,
  //       );
  //       await methods.asserByText(message.addKey.incorrectUser);
  //     });
  //     it('Must show error if not valid master password', async () => {
  //       await methods.clickNType(
  //         'popup_html_active',
  //         userData.one.nonEncryptKeys.randomStringKey51,
  //         true,
  //       );
  //       await methods.asserByText(message.addKey.incorrectKey);
  //     });
  //   });
  // });
});
