import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import { Icons, SVGIcons } from 'src/common-ui/icons.enum';

const click = async (testId: string) => {
  await userEvent.click(await screen.findByTestId(testId));
};

const menuItem = (icon: string) => dataTestIdButton.menuPreFix + icon;

export const openSettingsMainPage = () => click(dataTestIdButton.menu);

export const openHiveSettingsMenu = async () => {
  await openSettingsMainPage();
  await click(menuItem(SVGIcons.MENU_HIVE_SETTINGS));
};

export const openGovernancePage = async () => {
  await openHiveSettingsMenu();
  await click(menuItem(Icons.GOVERNANCE));
};

export const openHelpMenu = async () => {
  await openSettingsMainPage();
  await click(menuItem(SVGIcons.MENU_HELP));
};

export const openNetworkSettings = async () => {
  await openSettingsMainPage();
  await click(menuItem(Icons.RPC));
};

export const openKeychainifySettings = async () => {
  await openHiveSettingsMenu();
  await click(menuItem(Icons.LINK));
};

export const openAutomatedTasks = async () => {
  await openHiveSettingsMenu();
  await click(menuItem(Icons.AUTOMATED_TASKS));
};

export const openAddAccountPage = async () => {
  await click('account-selector-trigger');
  await click('account-selector-create-button');
};

export const openManageAccountsPage = async () => {
  await click('account-selector-trigger');
  const [manageButton] = await screen.findAllByTestId(
    /account-selector-manage-hive-/,
  );
  await userEvent.click(manageButton);
};
