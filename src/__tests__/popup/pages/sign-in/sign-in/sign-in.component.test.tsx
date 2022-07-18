import App from '@popup/App';
import React from 'react';
import signIn from 'src/__tests__/popup/pages/sign-in/sign-in/mocks/sign-in';
import alLogo from 'src/__tests__/utils-for-testing/aria-labels/al-logo';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { actAdvanceTime } from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();

describe('sign-in.component.tsx tests:\n', () => {
  beforeEach(async () => {
    await signIn.beforeEach(<App />);
  });
  afterEach(() => {
    afterTests.clean();
  });
  it('Must show error message after pressing enter', async () => {
    signIn.extraMocks.login(false);
    await signIn.methods.typeNEnter('incorrect_password{enter}');
    await assertion.awaitFor(signIn.constants.errorMessage, QueryDOM.BYTEXT);
  });

  it('Must show error message after clicking submit', async () => {
    signIn.extraMocks.login(false);
    await signIn.methods.typeNClick('incorrect_password');
    await assertion.awaitFor(signIn.constants.errorMessage, QueryDOM.BYTEXT);
  });

  it('Must navigate to home page when pressing enter key', async () => {
    signIn.extraMocks.login(true);
    signIn.extraMocks.getMkFromLocalStorage();
    await signIn.methods.typeNEnter('correct_password{enter}');
    actAdvanceTime(3300);
    await assertion.awaitFor(alLogo.loading, QueryDOM.BYLABEL);
  });

  it('Must navigate to home page when clicking submit button', async () => {
    signIn.extraMocks.login(true);
    signIn.extraMocks.getMkFromLocalStorage();
    await signIn.methods.typeNClick('correct_password');
    actAdvanceTime(3300);
    await assertion.awaitFor(alLogo.loading, QueryDOM.BYLABEL);
  });
});
