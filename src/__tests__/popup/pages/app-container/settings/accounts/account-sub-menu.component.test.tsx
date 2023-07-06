import AccountUtils from '@hiveapp/utils/account.utils';
import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdIcon from 'src/__tests__/utils-for-testing/data-testid/data-testid-icon';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { Icons } from 'src/common-ui/icons.enum';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';
import AccountSubMenuItems from 'src/popup/hive/pages/app-container/settings/accounts/account-sub-menu-items';

describe('account-sub-menu.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  beforeEach(async () => {
    await reactTestingLibrary.renderWithConfiguration(
      <HiveAppComponent />,
      initialStates.iniStateAs.defaultExistent,
    );
    await act(async () => {
      await userEvent.click(screen.getByTestId(dataTestIdButton.menu));
      await userEvent.click(
        screen.getByTestId(dataTestIdButton.menuPreFix + Icons.ACCOUNTS),
      );
    });
  });

  it('Must show sub account menu page', async () => {
    expect(
      screen.getByTestId(`${Screen.SETTINGS_ACCOUNTS}-page`),
    ).toBeInTheDocument();
  });

  it('Must show sub menu items', () => {
    for (let i = 0; i < AccountSubMenuItems.length; i++) {
      expect(
        screen.getByTestId(
          dataTestIdButton.menuPreFix + AccountSubMenuItems[i].icon,
        ),
      ).toBeInTheDocument();
    }
  });

  it('Must open each account sub menu item', async () => {
    for (let i = 0; i < AccountSubMenuItems.length; i++) {
      if (AccountSubMenuItems[i].nextScreen) {
        await act(async () => {
          await userEvent.click(
            screen.getByTestId(
              dataTestIdButton.menuPreFix + AccountSubMenuItems[i].icon,
            ),
          );
        });
        expect(
          await screen.findByTestId(
            `${AccountSubMenuItems[i].nextScreen}-page`,
          ),
        ).toBeInTheDocument();
        await act(async () => {
          await userEvent.click(screen.getByTestId(dataTestIdIcon.arrowBack));
        });
      }
    }
  });

  it('Must call export account action', async () => {
    window.URL.createObjectURL = jest.fn();
    HTMLAnchorElement.prototype.click = jest.fn();
    const sDownloadAccounts = jest
      .spyOn(AccountUtils, 'downloadAccounts')
      .mockImplementation((...args) => Promise.resolve(undefined));
    await act(async () => {
      await userEvent.click(
        screen.getByTestId(dataTestIdButton.menuPreFix + Icons.EXPORT),
      );
    });
    expect(sDownloadAccounts).toHaveBeenCalledTimes(1);
    sDownloadAccounts.mockRestore();
  });
});
