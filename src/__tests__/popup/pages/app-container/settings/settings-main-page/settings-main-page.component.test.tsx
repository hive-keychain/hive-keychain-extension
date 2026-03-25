import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdIcon from 'src/__tests__/utils-for-testing/data-testid/data-testid-icon';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';
import SettingsMenuItems from 'src/popup/hive/pages/app-container/settings/settings-main-page/settings-main-page-menu-items';

describe('settings-main-page.component tests:\n', () => {
  const menuItems = SettingsMenuItems(() => {});

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  beforeEach(async () => {
    await reactTestingLibrary.renderWithConfiguration(
      <HiveAppComponent />,
      initialStates.iniStateAs.defaultExistent,
      {
        app: {
          accountsRelated: {
            AccountUtils: {
              getAccountsFromLocalStorage: accounts.twoAccounts,
            },
          },
        },
      },
    );
    await act(async () => {
      await userEvent.click(screen.getByTestId(dataTestIdButton.menu));
    });
  });
  it('Must show all menu items', () => {
    for (let i = 0; i < menuItems.length; i++) {
      expect(
        screen.getByTestId(
          dataTestIdButton.menuPreFix + menuItems[i].icon,
        ),
      ).toBeInTheDocument();
    }
  });
  it('Must open each menu item', async () => {
    const pageItems = menuItems.filter((item) => item.nextScreen);
    for (let i = 0; i < pageItems.length; i++) {
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(
            dataTestIdButton.menuPreFix + pageItems[i].icon,
          ),
        );
      });
      expect(
        screen.getByTestId(pageItems[i].nextScreen + '-page'),
      ).toBeInTheDocument();
      await act(async () => {
        await userEvent.click(screen.getByTestId(dataTestIdIcon.arrowBack));
      });
    }
  });
  it('Must open a new window when clicking PeakD link', async () => {
    const spy = jest.spyOn(chrome.tabs, 'create');
    await act(async () => {
      await userEvent.click(
        document.querySelector(
          '.link-panel .network-icon',
        ) as HTMLElement,
      );
    });
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
