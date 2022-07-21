import App from '@popup/App';
import { screen, waitFor } from '@testing-library/react';
import React from 'react';
import addByKeysBeforeEach from 'src/__tests__/popup/pages/add-account/add-by-keys/mocks/add-by-keys-before-each';
import addByKeysMocks from 'src/__tests__/popup/pages/add-account/add-by-keys/mocks/add-by-keys-mocks';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alCheckbox from 'src/__tests__/utils-for-testing/aria-labels/al-checkbox';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import config from 'src/__tests__/utils-for-testing/setups/config';
import {
  actPendingTimers,
  clickAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
const deselectAll = async () => {
  await clickAwait([
    alCheckbox.selectKeys.import.activeKey,
    alCheckbox.selectKeys.import.postingkey,
    alCheckbox.selectKeys.import.memoKey,
  ]);
};
describe('select-keys.component tests:\n', () => {
  beforeEach(async () => {
    await addByKeysBeforeEach.beforeEach(<App />, [], false);
    await assertion.awaitFind(alButton.addByKeys);
    addByKeysMocks.extraMocks.getAccounts();
    await addByKeysMocks.typeAndSubmit(userData.one.nonEncryptKeys.master);
    await deselectAll();
  });
  afterEach(() => {
    afterTests.clean();
  });
  it('Must load the import keys page', async () => {
    await waitFor(() => {
      expect(screen.getByLabelText(alComponent.selectPage)).toBeDefined();
      expect(
        ['Posting Key', 'Active Key', 'Memo Key'].forEach((userKey) => {
          expect(screen.getByText(userKey)).toBeInTheDocument();
        }),
      );
    });
  });
  it('Must import the  selected active key', async () => {
    await clickAwait([alCheckbox.selectKeys.import.activeKey, alButton.save]);
    await actPendingTimers();
    await assertion.awaitFor(alComponent.homePage, QueryDOM.BYLABEL);
  });
  it('Must import the selected posting key', async () => {
    await clickAwait([alCheckbox.selectKeys.import.postingkey, alButton.save]);
    await actPendingTimers();
    await assertion.awaitFor(alComponent.homePage, QueryDOM.BYLABEL);
  });
  it('Must import the selected memo key', async () => {
    await clickAwait([alCheckbox.selectKeys.import.memoKey, alButton.save]);
    await actPendingTimers();
    await assertion.awaitFor(alComponent.homePage, QueryDOM.BYLABEL);
  });
  it('Must show error if no key selected', async () => {
    const errorMessage = mocksImplementation.i18nGetMessageCustom(
      'popup_accounts_no_key_selected',
    );
    await clickAwait([alButton.save]);
    await assertion.awaitFor(errorMessage, QueryDOM.BYTEXT);
  });
});
