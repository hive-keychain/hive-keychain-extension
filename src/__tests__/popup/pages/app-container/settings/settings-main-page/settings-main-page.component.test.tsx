import App from '@popup/App';
import { Icons } from '@popup/icons.enum';
import SettingsMenuItems from '@popup/pages/app-container/settings/settings-main-page/settings-main-page-menu-items';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ariaLabelButton from 'src/__tests__/utils-for-testing/aria-labels/aria-label-button';
import ariaLabelIcon from 'src/__tests__/utils-for-testing/aria-labels/aria-label-icon';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/rtl-render/rtl-render-functions';
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
      await userEvent.click(screen.getByLabelText(ariaLabelButton.menu));
    });
  });
  it('Must show all menu items', () => {
    for (let i = 0; i < SettingsMenuItems.length; i++) {
      expect(
        screen.getByLabelText(
          ariaLabelButton.menuPreFix + SettingsMenuItems[i].icon,
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
            ariaLabelButton.menuPreFix + filteredCopyItems[i].icon,
          ),
        );
      });
      expect(
        screen.getByLabelText(filteredCopyItems[i].icon + '-page'),
      ).toBeInTheDocument();
      await act(async () => {
        await userEvent.click(screen.getByLabelText(ariaLabelIcon.arrowBack));
      });
    }
  });
  it('Must open a new window when clicking support', async () => {
    await act(async () => {
      await userEvent.click(
        screen.getByLabelText(ariaLabelButton.menuPreFix + Icons.SUPPORT),
      );
    });
    expect(jest.spyOn(chrome.tabs, 'create')).toBeCalledTimes(1);
  });
});
