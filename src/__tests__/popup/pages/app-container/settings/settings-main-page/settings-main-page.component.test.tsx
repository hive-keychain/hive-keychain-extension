import App from '@popup/App';
import { Icons } from '@popup/icons.enum';
import SettingsMenuItems from '@popup/pages/app-container/settings/settings-main-page/settings-main-page-menu-items';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdIcon from 'src/__tests__/utils-for-testing/data-testid/data-testid-icon';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
describe('settings-main-page.component tests:\n', () => {
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
    });
  });
  it('Must show all menu items', () => {
    for (let i = 0; i < SettingsMenuItems.length; i++) {
      expect(
        screen.getByLabelText(
          dataTestIdButton.menuPreFix + SettingsMenuItems[i].icon,
        ),
      ).toBeInTheDocument();
    }
  });
  it('Must open each menu item', async () => {
    const filteredCopyItems = SettingsMenuItems.filter(
      (menuItem) => menuItem.icon !== Icons.SUPPORT,
    );
    for (let i = 0; i < filteredCopyItems.length; i++) {
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(
            dataTestIdButton.menuPreFix + filteredCopyItems[i].icon,
          ),
        );
      });
      expect(
        screen.getByLabelText(filteredCopyItems[i].nextScreen + '-page'),
      ).toBeInTheDocument();
      await act(async () => {
        await userEvent.click(screen.getByLabelText(dataTestIdIcon.arrowBack));
      });
    }
  });
  it('Must open a new window when clicking support', async () => {
    await act(async () => {
      await userEvent.click(
        screen.getByLabelText(dataTestIdButton.menuPreFix + Icons.SUPPORT),
      );
    });
    expect(jest.spyOn(chrome.tabs, 'create')).toBeCalledTimes(1);
  });
});
