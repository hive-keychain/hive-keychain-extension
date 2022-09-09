import App from '@popup/App';
import { screen, waitFor } from '@testing-library/react';
import React from 'react';
import addByKeysBeforeEach from 'src/__tests__/popup/pages/add-account/add-by-keys/mocks/add-by-keys-before-each';
import addByKeysMocks from 'src/__tests__/popup/pages/add-account/add-by-keys/mocks/add-by-keys-mocks';
import addByKeysExtraCases from 'src/__tests__/popup/pages/add-account/add-by-keys/othercases/add-by-keys-extra-cases';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import {
  EventType,
  InputField,
  QueryDOM,
} from 'src/__tests__/utils-for-testing/enums/enums';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { clickTypeAwait } from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
describe('add-by-keys:\n', () => {
  afterEach(() => {
    afterTests.clean();
  });
  describe('add-by-keys tests(no accounts):\n', () => {
    beforeEach(async () => {
      await addByKeysBeforeEach.beforeEach(<App />, [], false);
      expect(
        await screen.findByLabelText(alButton.addByKeys),
      ).toBeInTheDocument();
    });
    it('Must add valid posting key and load homepage', async () => {
      addByKeysMocks.extraMocks.getAccount();
      await addByKeysMocks.typeAndSubmit(userData.one.nonEncryptKeys.posting);
      await waitFor(() => {
        expect(screen.getByLabelText(alComponent.homePage)).toBeDefined();
        expect(screen.getByText(mk.user.one)).toBeDefined();
      });
    });
    it('Must add valid memo key and load homepage', async () => {
      addByKeysMocks.extraMocks.getAccount();
      await addByKeysMocks.typeAndSubmit(userData.one.nonEncryptKeys.memo);
      await waitFor(() => {
        expect(screen.getByLabelText(alComponent.homePage)).toBeDefined();
        expect(screen.getByText(mk.user.one)).toBeDefined();
      });
    });
    it('Must add valid active key and load homepage', async () => {
      addByKeysMocks.extraMocks.getAccount();
      await addByKeysMocks.typeAndSubmit(userData.one.nonEncryptKeys.active);
      await waitFor(() => {
        expect(screen.getByLabelText(alComponent.homePage)).toBeDefined();
        expect(screen.getByText(mk.user.one)).toBeDefined();
      });
    });
    it('Must derivate all keys from master, and navigate to select keys page', async () => {
      addByKeysMocks.extraMocks.getAccount();
      await addByKeysMocks.typeAndSubmit(userData.one.nonEncryptKeys.master);
      await waitFor(() => {
        expect(screen.getByLabelText(alComponent.selectPage)).toBeDefined();
        expect(
          ['Posting Key', 'Active Key', 'Memo Key'].forEach((userKey) => {
            expect(screen.getByText(userKey)).toBeInTheDocument();
          }),
        );
      });
    });
    it.skip('Must show error if empty username', async () => {
      const errorMessage = mocksImplementation.i18nGetMessageCustom(
        'popup_accounts_fill',
      );
      await addByKeysMocks.typeAndSubmitWEmpty(
        userData.one.nonEncryptKeys.active,
        InputField.USERNAME,
      );
      await assertion.awaitFor(errorMessage, QueryDOM.BYTEXT);
    });
    it.skip('Must show error if empty password', async () => {
      const errorMessage = mocksImplementation.i18nGetMessageCustom(
        'popup_accounts_fill',
      );
      await addByKeysMocks.typeAndSubmitWEmpty(
        userData.one.username,
        InputField.PRIVATEKEY,
      );
      await assertion.awaitFor(errorMessage, QueryDOM.BYTEXT);
    });
    it.skip('Must show error if empty username and empty password', async () => {
      const errorMessage = mocksImplementation.i18nGetMessageCustom(
        'popup_accounts_fill',
      );
      await clickTypeAwait([
        { ariaLabel: alButton.addByKeys, event: EventType.CLICK },
        { ariaLabel: alButton.submit, event: EventType.CLICK },
      ]);
      await assertion.awaitFor(errorMessage, QueryDOM.BYTEXT);
    });
    it.skip('Must show error when using a public key', async () => {
      const errorMessage = mocksImplementation.i18nGetMessageCustom(
        'popup_account_password_is_public_key',
      );
      await addByKeysMocks.typeAndSubmit(userData.one.encryptKeys.posting);
      await assertion.awaitFor(errorMessage, QueryDOM.BYTEXT);
    });
    it.skip('Must show error when using an incorrect key', async () => {
      const errorMessage = mocksImplementation.i18nGetMessageCustom(
        'popup_accounts_incorrect_key',
      );
      await addByKeysMocks.typeAndSubmit(userData.one.nonEncryptKeys.fakeKey);
      await assertion.awaitFor(errorMessage, QueryDOM.BYTEXT);
    });
    it.skip('Must show error when using an incorrect username', async () => {
      const errorMessage = mocksImplementation.i18nGetMessageCustom(
        'popup_accounts_incorrect_user',
      );
      mockPreset.setOrDefault({
        app: { getAccount: [] },
      });
      await addByKeysMocks.typeAndSubmit(userData.one.nonEncryptKeys.fakeKey);
      await assertion.awaitFor(errorMessage, QueryDOM.BYTEXT);
    });
  });

  describe('add-by-keys tests (with accounts):\n', () => {
    beforeEach(async () => {
      await addByKeysBeforeEach.beforeEach(<App />, accounts.twoAccounts, true);
      await assertion.awaitMk(mk.user.one);
    });
    addByKeysExtraCases.wAccounts();
  });
});
