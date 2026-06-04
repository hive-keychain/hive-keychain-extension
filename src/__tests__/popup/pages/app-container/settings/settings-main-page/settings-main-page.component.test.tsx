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
import { getSettingsMainPageMenuItems } from 'src/popup/multichain/pages/settings/settings-main-page-menu-items';
import { SVGIcons } from 'src/common-ui/icons.enum';

describe('settings-main-page.component tests:\n', () => {
  const menuItems = getSettingsMainPageMenuItems({
    hasEvmAccounts: false,
    hasHiveAccounts: true,
  });

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
    const navigableMenuItems = menuItems.filter((item) => item.nextScreen);

    for (let i = 0; i < navigableMenuItems.length; i++) {
      expect(
        screen.getByTestId(
          dataTestIdButton.menuPreFix + navigableMenuItems[i].icon,
        ),
      ).toBeInTheDocument();
    }

    expect(
      screen.getByTestId(
        dataTestIdButton.menuPreFix + SVGIcons.MENU_USER_PREFERENCES_THEME,
      ),
    ).toBeInTheDocument();
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
