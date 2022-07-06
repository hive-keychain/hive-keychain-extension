import App from '@popup/App';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import React from 'react';
import home from 'src/__tests__/popup/pages/app-container/home/mocks/home/home';
import actionButtons from 'src/__tests__/popup/pages/app-container/othercases/home/action-buttons';
import dropdownHbd from 'src/__tests__/popup/pages/app-container/othercases/home/dropdown-hbd';
import dropdownHive from 'src/__tests__/popup/pages/app-container/othercases/home/dropdown-hive';
import dropdownHp from 'src/__tests__/popup/pages/app-container/othercases/home/dropdown-hp';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alDiv from 'src/__tests__/utils-for-testing/aria-labels/al-div';
import alDropdown from 'src/__tests__/utils-for-testing/aria-labels/al-dropdown';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
import alSelect from 'src/__tests__/utils-for-testing/aria-labels/al-select';
import alToolTip from 'src/__tests__/utils-for-testing/aria-labels/al-toolTip';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import config from 'src/__tests__/utils-for-testing/setups/config';
import {
  actAdvanceTime,
  clickAwait,
  userEventPendingTimers,
} from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
describe('home.component tests:\n', () => {
  beforeEach(async () => {
    await home.beforeEach(<App />, accounts.twoAccounts);
    await assertion.awaitFind(alComponent.homePage);
  });
  afterEach(() => {
    afterTests.clean();
  });
  it('Must show home page and user information', () => {
    home.userInformation();
  });
  it('Must show tool tip when hover on mana', async () => {
    await userEventPendingTimers.hover(
      screen.getByLabelText(alToolTip.custom.resources.votingMana),
    );
    expect(screen.getByLabelText(alToolTip.content)).toBeInTheDocument();
    expect(screen.getByText(home.methods.manaReadyIn())).toBeInTheDocument();
  });
  it('Must show tool tip when hover on credits', async () => {
    await userEventPendingTimers.hover(
      screen.getByLabelText(alToolTip.custom.resources.resourceCredits),
    );
    expect(screen.getByLabelText(alToolTip.content)).toBeInTheDocument();
    expect(screen.getByText(home.methods.rcReadyIn())).toBeInTheDocument();
  });
  it('Must change active account to the selected one', async () => {
    await clickAwait([
      alSelect.accountSelector,
      alSelect.itemSelectorPreFix + mk.user.two,
    ]);
    expect(screen.getByLabelText(alDiv.selectedAccount)).toHaveTextContent(
      mk.user.two,
    );
  });
  it('Must refresh data when click on logo', async () => {
    mockPreset.setOrDefault({
      home: { getAccountValue: home.constants.estimatedValue },
    });
    await clickAwait([alIcon.refreshHome]);
    actAdvanceTime(4300);
    await assertion.awaitFindText(`$ ${home.constants.estimatedValue} USD`);
  });
  it('Must log out user when clicking on log out', async () => {
    await clickAwait([alButton.logOut]);
    expect(screen.getByLabelText(alComponent.signIn)).toBeInTheDocument();
  });
  it('Must show menu settings', async () => {
    await clickAwait([alButton.menu]);
    assertion.getByText(home.constants.iconsMenuSettings);
  });
  it('Must show dropdown menu on HIVE balance', async () => {
    await clickAwait([alDropdown.arrow.hive]);
    assertion.getByText(home.constants.menuItems.hive);
  });
  it('Must show dropdown menu on HBD balance', async () => {
    await clickAwait([alDropdown.arrow.hbd]);
    assertion.getByText(home.constants.menuItems.hbd);
  });
  it('Must show dropdown menu on HP balance', async () => {
    await clickAwait([alDropdown.arrow.hp]);
    assertion.getByText(home.constants.menuItems.hp);
  });
  describe('dropdown hive menu:\n', () => {
    dropdownHive.run();
  });
  describe('dropdown hbd menu:\n', () => {
    dropdownHbd.run();
  });
  describe('dropdown hp menu:\n', () => {
    dropdownHp.run();
  });
  describe('action-buttons:\n', () => {
    actionButtons.run();
  });
});
