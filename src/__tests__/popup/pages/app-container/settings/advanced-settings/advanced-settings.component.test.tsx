import App from '@popup/App';
import { Icons } from '@popup/icons.enum';
import getAdvancedSettingsMenuItems from '@popup/pages/app-container/settings/advanced-settings/advanced-settings-menu-items';
import '@testing-library/jest-dom';
import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { act } from 'react-dom/test-utils';
import ariaLabelButton from 'src/__tests__/utils-for-testing/aria-labels/aria-label-button';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/rtl-render/rtl-render-functions';
// config.afterAllCleanAndResetMocks();
describe('advanced-settings.component tests:\n', () => {
  // const { methods, constants, menuPages, spies } = advanceSettings;
  // const { menuItems } = constants;
  // methods.afterEach;
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  beforeEach(async () => {
    // await advanceSettings.beforeEach(<App />);
    await reactTestingLibrary.renderWithConfiguration(
      <App />,
      initialStates.iniStateAs.defaultExistent,
      {
        app: {
          ledgerRelated: {
            LedgerUtils: {
              isLedgerSupported: true,
            },
          },
        },
      },
    );
    await act(async () => {
      await userEvent.click(screen.getByLabelText(ariaLabelButton.menu));
      await userEvent.click(
        screen.getByLabelText(ariaLabelButton.menuPreFix + Icons.SETTINGS),
      );
    });
  });
  //TODO check & fix & clean up
  it('Must load advance settings items', () => {
    const advanceMenuItems = getAdvancedSettingsMenuItems(true);
    for (let i = 0; i < advanceMenuItems.length; i++) {
      expect(
        screen.getByLabelText(
          ariaLabelButton.menuPreFix + advanceMenuItems[i].icon,
        ),
      ).toBeInTheDocument();
    }
  });

  // it('Must open each menu page with no actions', async () => {
  //   const menuAdvanceSettingsFilteredNoActions =
  //     menuItems.advanceSettings.filter((item) => !item.action);
  //   for (let i = 0; i < menuAdvanceSettingsFilteredNoActions.length; i++) {
  //     const arialLabel =
  //       alButton.menuPreFix + menuAdvanceSettingsFilteredNoActions[i].icon;
  //     await clickAwait([arialLabel]);
  //     await assertion.awaitFor(menuPages[i].ariaLabel, QueryDOM.BYLABEL);
  //     await clickAwait([alIcon.arrowBack]);
  //     await assertion.awaitFor(alComponent.settingsPage, QueryDOM.BYLABEL);
  //   }
  // });
  //TODO check & fix!
  // it('Must call tabs.create when opening ledger menu', async () => {
  //   const tabId = 'unique-ID';
  //   chrome.management.getSelf = jest.fn().mockResolvedValue({ id: tabId });
  //   const ledgerMenuItem = menuItems.advanceSettings.filter(
  //     (item) => item.label === 'ledger_link_ledger_device',
  //   )[0];
  //   const ariaLabel = alButton.menuPreFix + ledgerMenuItem.icon;
  //   await clickAwait([ariaLabel]);
  //   expect(spies.chrome.tabs.create()).toBeCalledWith({
  //     url: `chrome-extension://${tabId}/link-ledger-device.html`,
  //   });
  // });
});
