import App from '@popup/App';
import { Icons } from '@popup/icons.enum';
import AccountSubMenuItems from '@popup/pages/app-container/settings/accounts/account-sub-menu-items';
import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ariaLabelButton from 'src/__tests__/utils-for-testing/aria-labels/aria-label-button';
import ariaLabelIcon from 'src/__tests__/utils-for-testing/aria-labels/aria-label-icon';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/rtl-render/rtl-render-functions';
import AccountUtils from 'src/utils/account.utils';
describe('account-sub-menu.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  beforeEach(async () => {
    await reactTestingLibrary.renderWithConfiguration(
      <App />,
      initialStates.iniStateAs.defaultExistent,
    );
    await act(async () => {
      await userEvent.click(screen.getByLabelText(ariaLabelButton.menu));
      await userEvent.click(
        screen.getByLabelText(ariaLabelButton.menuPreFix + Icons.ACCOUNTS),
      );
    });
  });

  it('Must show sub account menu page', () => {
    expect(
      screen.getByLabelText(`${Screen.SETTINGS_ACCOUNTS}-page`),
    ).toBeInTheDocument();
  });

  it('Must show sub menu items', () => {
    for (let i = 0; i < AccountSubMenuItems.length; i++) {
      expect(
        screen.getByLabelText(
          ariaLabelButton.menuPreFix + AccountSubMenuItems[i].icon,
        ),
      ).toBeInTheDocument();
    }
  });

  it('Must open each account sub menu item', async () => {
    for (let i = 0; i < AccountSubMenuItems.length; i++) {
      if (AccountSubMenuItems[i].nextScreen) {
        await act(async () => {
          await userEvent.click(
            screen.getByLabelText(
              ariaLabelButton.menuPreFix + AccountSubMenuItems[i].icon,
            ),
          );
        });
        expect(
          await screen.findByLabelText(
            `${AccountSubMenuItems[i].nextScreen}-page`,
          ),
        ).toBeInTheDocument();
        await act(async () => {
          await userEvent.click(screen.getByLabelText(ariaLabelIcon.arrowBack));
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
        screen.getByLabelText(ariaLabelButton.menuPreFix + Icons.EXPORT),
      );
    });
    expect(sDownloadAccounts).toHaveBeenCalledTimes(1);
    sDownloadAccounts.mockRestore();
  });
});
