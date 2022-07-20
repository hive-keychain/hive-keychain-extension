import App from '@popup/App';
import React from 'react';
import signUp from 'src/__tests__/popup/pages/sign-up/mocks/sign-up';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import config from 'src/__tests__/utils-for-testing/setups/config';
config.byDefault();
describe('sign-up.component tests:\n', () => {
  beforeEach(async () => {
    await signUp.beforeEach(<App />);
  });
  afterEach(() => {
    afterTests.clean();
  });
  it('Must show sign-up page', () => {
    assertion.getByLabelText(alComponent.signUp);
  });
  it('Must show error message when using different passwords and pressing enter', async () => {
    await signUp.methods.typeNEnter('@1qEWqw!!', '1qEWqw{enter}');
    await assertion.awaitFor(
      signUp.methods.message('popup_password_mismatch'),
      QueryDOM.BYTEXT,
    );
  });
  it('Must show error message when using different passwords and clicking button', async () => {
    await signUp.methods.typeNClick('@1qEWqw!!', '1qEWqw');
    await assertion.awaitFor(
      signUp.methods.message('popup_password_mismatch'),
      QueryDOM.BYTEXT,
    );
  });
  it('Must show error message when invalid password and pressing enter', async () => {
    await signUp.methods.typeNEnter('1qEWqw', '1qEWqw{enter}');
    await assertion.awaitFor(
      signUp.methods.message('popup_password_regex'),
      QueryDOM.BYTEXT,
    );
  });
  it('Must show error message when invalid password and clicking button', async () => {
    await signUp.methods.typeNClick('1qEWqw', '1qEWqw');
    await assertion.awaitFor(
      signUp.methods.message('popup_password_regex'),
      QueryDOM.BYTEXT,
    );
  });
  it('Must navigate to add_keys_page with valid password and pressing enter', async () => {
    await signUp.methods.typeNEnter('1qEWqw23', '1qEWqw23{enter}');
    await assertion.awaitFor(alComponent.addAccountMain, QueryDOM.BYLABEL);
  });
  it('Must navigate to add_keys_page with valid password and clicking button', async () => {
    await signUp.methods.typeNClick('1qEWqw23', '1qEWqw23');
    await assertion.awaitFor(alComponent.addAccountMain, QueryDOM.BYLABEL);
  });
});
