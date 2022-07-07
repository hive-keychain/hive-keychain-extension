import App from '@popup/App';
import React from 'react';
import signIn from 'src/__tests__/popup/pages/sign-in/sign-in/mocks/sign-in';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { actRunAllTimers } from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();

describe('sign-in.component.tsx tests:\n', () => {
  beforeEach(async () => {
    await signIn.beforeEach(<App />);
    await assertion.awaitFind(alComponent.signIn);
  });
  afterEach(() => {
    afterTests.clean();
  });
  it('Must show error message after pressing enter', async () => {
    signIn.extraMocks(false);
    await signIn.methods.typeNEnter();
    await assertion.awaitFor(signIn.constants.errorMessage, QueryDOM.BYTEXT);
  });

  it('Must show error message after clicking submit', async () => {
    signIn.extraMocks(false);
    await signIn.methods.typeNClick();
    await assertion.awaitFor(signIn.constants.errorMessage, QueryDOM.BYTEXT);
  });

  it('Must navigate to home page when pressing enter key', async () => {
    signIn.extraMocks(true);
    await signIn.methods.typeNEnter();
    actRunAllTimers();
    await assertion.awaitFor(alComponent.homePage, QueryDOM.BYLABEL);
  });

  it('Must navigate to home page when clicking submit button', async () => {
    signIn.extraMocks(true);
    await signIn.methods.typeNClick();
    actRunAllTimers();
    await assertion.awaitFor(alComponent.homePage, QueryDOM.BYLABEL);
  });
});
