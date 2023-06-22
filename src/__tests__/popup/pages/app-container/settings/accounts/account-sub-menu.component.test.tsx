import App from '@popup/App';
import { Icons } from '@popup/icons.enum';
import AccountSubMenuItems from '@popup/pages/app-container/settings/accounts/account-sub-menu-items';
import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdIcon from 'src/__tests__/utils-for-testing/data-testid/data-testid-icon';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import AccountUtils from 'src/utils/account.utils';
//TODO after refactoring all test, ensure all works, change aria-labels to test
// in the component/html ele => data-testid="settings-accounts-page"
//  i.e: testing will look like -> expect(screen.getByTestId('settings-accounts-page')).toBeInTheDocument();
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
      await userEvent.click(screen.getByLabelText(dataTestIdButton.menu));
      await userEvent.click(
        screen.getByLabelText(dataTestIdButton.menuPreFix + Icons.ACCOUNTS),
      );
    });
  });

  it('Must show sub account menu page', async () => {
    expect(
      screen.getByLabelText(`${Screen.SETTINGS_ACCOUNTS}-page`),
    ).toBeInTheDocument();
  });

  it('Must show sub menu items', () => {
    for (let i = 0; i < AccountSubMenuItems.length; i++) {
      expect(
        screen.getByLabelText(
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
            screen.getByLabelText(
              dataTestIdButton.menuPreFix + AccountSubMenuItems[i].icon,
            ),
          );
        });
        expect(
          await screen.findByLabelText(
            `${AccountSubMenuItems[i].nextScreen}-page`,
          ),
        ).toBeInTheDocument();
        await act(async () => {
          await userEvent.click(
            screen.getByLabelText(dataTestIdIcon.arrowBack),
          );
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
        screen.getByLabelText(dataTestIdButton.menuPreFix + Icons.EXPORT),
      );
    });
    expect(sDownloadAccounts).toHaveBeenCalledTimes(1);
    sDownloadAccounts.mockRestore();
  });
});
