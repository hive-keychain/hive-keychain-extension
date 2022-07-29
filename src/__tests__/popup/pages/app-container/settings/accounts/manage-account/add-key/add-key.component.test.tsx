import { KeyType } from '@interfaces/keys.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { screen } from '@testing-library/react';
import manageAccounts from 'src/__tests__/popup/pages/app-container/settings/accounts/manage-account/mocks/manage-accounts';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
import alParagraph from 'src/__tests__/utils-for-testing/aria-labels/al-paragraph';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import {
  KeyToUseNoMaster,
  QueryDOM,
} from 'src/__tests__/utils-for-testing/enums/enums';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
describe('add-key.component tests:\n', () => {
  let _asFragment: () => DocumentFragment | undefined;
  const { methods, constants, extraMocks, keys } = manageAccounts;
  const { localAccount, message } = constants;
  methods.afterEach;
  beforeEach(async () => {
    const cloneLocalAccounts = objects.clone(localAccount) as LocalAccount[];
    methods.removeKeysLocalAccount(cloneLocalAccounts[0], [
      KeyToUseNoMaster.ACTIVE,
      KeyToUseNoMaster.MEMO,
    ]);
    _asFragment = await manageAccounts.beforeEach({
      localAccount: cloneLocalAccounts,
    });
  });
  it('Must load add key message', async () => {
    await clickAwait([
      alIcon.keys.list.preFix.add + methods.getKeyName('popup_html_active'),
    ]);
    expect(
      await screen.findByLabelText(alParagraph.add.keyPage.introduction),
    ).toHaveTextContent(constants.message.addKey.text(KeyType.ACTIVE));
  });
  describe('Hitting enter:/n', () => {
    it('Must show error if empty key', async () => {
      await methods.clickNType('popup_html_active', ' {enter}');
      await methods.asserByText(message.addKey.missingFields);
    });
    it('Must add active key', async () => {
      await methods.clickNType(
        'popup_html_active',
        userData.one.nonEncryptKeys.active + '{enter}',
      );
      await methods.asserByText(userData.one.encryptKeys.active);
    });
    it('Must add memo key', async () => {
      await methods.clickNType(
        'popup_html_memo',
        userData.one.nonEncryptKeys.memo + '{enter}',
      );
      await assertion.awaitFor(userData.one.encryptKeys.memo, QueryDOM.BYTEXT);
    });
    describe('Using master:\n', () => {
      it('Must add active key using master password', async () => {
        await methods.clickNType(
          'popup_html_active',
          userData.one.nonEncryptKeys.master + '{enter}',
        );
        await methods.asserByText(userData.one.encryptKeys.active);
      });
      it('Must add memo key using master password', async () => {
        await methods.clickNType(
          'popup_html_memo',
          userData.one.nonEncryptKeys.master + '{enter}',
        );
        await methods.asserByText(userData.one.encryptKeys.memo);
      });
    });
  });
  describe('Clicking import:\n', () => {
    it('Must show error if empty key', async () => {
      await methods.clickNType('popup_html_active', '{space}', true);
      await methods.asserByText(message.addKey.missingFields);
    });
    it('Must add active key', async () => {
      await methods.clickNType(
        'popup_html_active',
        userData.one.nonEncryptKeys.active,
        true,
      );
      await methods.asserByText(userData.one.encryptKeys.active);
    });
    it('Must add memo key', async () => {
      await methods.clickNType(
        'popup_html_memo',
        userData.one.nonEncryptKeys.memo,
        true,
      );
      await assertion.awaitFor(userData.one.encryptKeys.memo, QueryDOM.BYTEXT);
    });
    describe('Using master:\n', () => {
      it('Must add active key using master password', async () => {
        await methods.clickNType(
          'popup_html_active',
          userData.one.nonEncryptKeys.master,
          true,
        );
        await methods.asserByText(userData.one.encryptKeys.active);
      });
      it('Must add memo key using master password', async () => {
        await methods.clickNType(
          'popup_html_memo',
          userData.one.nonEncryptKeys.master,
          true,
        );
        await methods.asserByText(userData.one.encryptKeys.memo);
      });
    });
    describe.skip('Error cases:\n', () => {
      //TODO uncomment, waiting for fixes on dispatcher.
      it.skip('Must show error if using public key', async () => {
        await methods.clickNType(
          'popup_html_active',
          userData.one.encryptKeys.active,
          true,
        );
        await methods.asserByText(message.addKey.isPublicKey);
      });
      it.skip('Must show error if user not found', async () => {
        extraMocks.getAccount([]);
        await methods.clickNType(
          'popup_html_active',
          userData.one.encryptKeys.active,
          true,
        );
        await methods.asserByText(message.addKey.incorrectUser);
      });
      it.skip('Must show error if not valid master password', async () => {
        await methods.clickNType(
          'popup_html_active',
          userData.one.nonEncryptKeys.randomStringKey51,
          true,
        );
        await methods.asserByText(message.addKey.incorrectKey);
      });
    });
  });
});
