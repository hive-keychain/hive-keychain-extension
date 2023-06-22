import App from '@popup/App';
import { Icons } from '@popup/icons.enum';
import getAdvancedSettingsMenuItems from '@popup/pages/app-container/settings/advanced-settings/advanced-settings-menu-items';
import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { act } from 'react-dom/test-utils';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdIcon from 'src/__tests__/utils-for-testing/data-testid/data-testid-icon';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
describe('advanced-settings.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  beforeEach(async () => {
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
      await userEvent.click(screen.getByLabelText(dataTestIdButton.menu));
      await userEvent.click(
        screen.getByLabelText(dataTestIdButton.menuPreFix + Icons.SETTINGS),
      );
    });
  });

  it('Must show advanced settings page', () => {
    expect(
      screen.getByLabelText(`${Screen.SETTINGS_ADVANCED}-page`),
    ).toBeInTheDocument();
  });

  it('Must load advance settings items', () => {
    const advanceMenuItems = getAdvancedSettingsMenuItems(true);
    for (let i = 0; i < advanceMenuItems.length; i++) {
      expect(
        screen.getByLabelText(
          dataTestIdButton.menuPreFix + advanceMenuItems[i].icon,
        ),
      ).toBeInTheDocument();
    }
  });

  it('Must open each menu page with no actions', async () => {
    const menuItems = getAdvancedSettingsMenuItems(false);
    for (let i = 0; i < menuItems.length; i++) {
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(
            dataTestIdButton.menuPreFix + menuItems[i].icon,
          ),
        );
      });
      expect(screen.getByLabelText(`${menuItems[i].nextScreen}-page`));
      await act(async () => {
        await userEvent.click(screen.getByLabelText(dataTestIdIcon.arrowBack));
      });
    }
  });

  it('Must call tabs.create when opening ledger menu', async () => {
    const tabId = 'unique-ID';
    chrome.management.getSelf = jest.fn().mockResolvedValue({ id: tabId });
    const ledgerMenuItem = getAdvancedSettingsMenuItems(true).filter(
      (item) => item.label === 'ledger_link_ledger_device',
    )[0];
    await act(async () => {
      await userEvent.click(
        screen.getByLabelText(
          dataTestIdButton.menuPreFix + ledgerMenuItem.icon,
        ),
      );
    });
    expect(jest.spyOn(chrome.tabs, 'create')).toBeCalledWith({
      url: `chrome-extension://${tabId}/link-ledger-device.html`,
    });
  });
});
