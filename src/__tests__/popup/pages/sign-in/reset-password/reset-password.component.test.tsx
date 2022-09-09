import App from '@popup/App';
import '@testing-library/jest-dom';
import React from 'react';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
import alLink from 'src/__tests__/utils-for-testing/aria-labels/al-link';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import config from 'src/__tests__/utils-for-testing/setups/config';
import {
  actAdvanceTime,
  clickAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';
config.byDefault();

describe('reset-password.component tests:\n', () => {
  beforeEach(async () => {
    mockPreset.setOrDefault({
      app: {
        getActiveAccountNameFromLocalStorage: mk.empty,
        getMkFromLocalStorage: mk.empty,
      },
    });
    jest.useFakeTimers('legacy');
    actAdvanceTime(4300);
    customRender(<App />, {
      initialState: initialStates.iniStateAs.emptyState,
    });
    await assertion.awaitFind(alLink.resetPassword);
  });
  afterEach(() => {
    afterTests.clean();
  });
  it.skip('Must clear all user data and navigate to sign up page', async () => {
    await clickAwait([alLink.resetPassword, alButton.confirmResetPassword]);
    await assertion.awaitFor(alComponent.signUp, QueryDOM.BYLABEL);
  });
  it('Must cancel and return to previous window', async () => {
    await clickAwait([alLink.resetPassword]);
    assertion.queryByLabel(alButton.confirmResetPassword);
    await clickAwait([alIcon.arrowBack]);
    assertion.queryByLabel(alButton.confirmResetPassword, false);
  });
});
