import App from '@popup/App';
import { Icons } from '@popup/icons.enum';
import UserPreferencesMenuItems from '@popup/pages/app-container/settings/user-preferences/user-preferences-menu-items';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ariaLabelButton from 'src/__tests__/utils-for-testing/aria-labels/aria-label-button';
import ariaLabelIcon from 'src/__tests__/utils-for-testing/aria-labels/aria-label-icon';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/rtl-render/rtl-render-functions';
import LocalStorageUtils from 'src/utils/localStorage.utils';

describe('user-preferences.component tests:\n', () => {
  beforeEach(async () => {
    await reactTestingLibrary.renderWithConfiguration(
      <App />,
      initialStates.iniStateAs.defaultExistent,
    );
    await act(async () => {
      await userEvent.click(screen.getByLabelText(ariaLabelButton.menu));
      await userEvent.click(
        screen.getByLabelText(ariaLabelButton.menuPreFix + Icons.PREFERENCES),
      );
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  it('Must load each menu items', () => {
    UserPreferencesMenuItems.forEach((item) => {
      expect(screen.getByLabelText(ariaLabelButton.menuPreFix + item.icon));
    });
  });
  it('Must open each menu item', async () => {
    LocalStorageUtils.getMultipleValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue([]);
    for (let i = 0; i < UserPreferencesMenuItems.length; i++) {
      const menuButtonAriaLabel =
        ariaLabelButton.menuPreFix + UserPreferencesMenuItems[i].icon;
      const pageAriaLabel = UserPreferencesMenuItems[i].icon + '-page';
      await act(async () => {
        await userEvent.click(screen.getByLabelText(menuButtonAriaLabel));
      });
      expect(await screen.findByLabelText(pageAriaLabel)).toBeInTheDocument();
      await act(async () => {
        await userEvent.click(screen.getByLabelText(ariaLabelIcon.arrowBack));
      });
    }
  });
});
