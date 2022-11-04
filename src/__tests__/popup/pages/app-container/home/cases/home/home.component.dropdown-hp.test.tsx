import App from '@popup/App';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import React from 'react';
import home from 'src/__tests__/popup/pages/app-container/home/mocks/home/home';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alDropdown from 'src/__tests__/utils-for-testing/aria-labels/al-dropdown';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
describe('home.component dropdown hp tests:\n', () => {
  beforeEach(async () => {
    await home.beforeEach(<App />, accounts.twoAccounts);
    await clickAwait([alDropdown.arrow.hp]);
  });
  afterEach(() => {
    afterTests.clean();
  });
  it('Must show delegations page when clicking delegations', async () => {
    //TODO add the missing aria-labels + 2 menu items test cases.
    screen.debug();
    await clickAwait([alDropdown.span.delegations]);
    await assertion.awaitFor(alComponent.delegationsPage, QueryDOM.BYLABEL);
  });
  it('Must show power down page when clicking power down', async () => {
    await clickAwait([alDropdown.span.powerDown]);
    assertion.getByLabelText(alComponent.powerUpDownPage);
  });
});
