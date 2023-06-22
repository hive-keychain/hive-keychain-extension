import App from '@popup/App';
import { Icons } from '@popup/icons.enum';
import UserPreferencesMenuItems from '@popup/pages/app-container/settings/user-preferences/user-preferences-menu-items';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdIcon from 'src/__tests__/utils-for-testing/data-testid/data-testid-icon';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import LocalStorageUtils from 'src/utils/localStorage.utils';
describe('user-preferences.component tests:\n', () => {
  beforeEach(async () => {
    await reactTestingLibrary.renderWithConfiguration(
      <App />,
      initialStates.iniStateAs.defaultExistent,
    );
    await act(async () => {
      await userEvent.click(screen.getByLabelText(dataTestIdButton.menu));
      await userEvent.click(
        screen.getByLabelText(dataTestIdButton.menuPreFix + Icons.PREFERENCES),
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
      expect(screen.getByLabelText(dataTestIdButton.menuPreFix + item.icon));
    });
  });
  it('Must open each menu item', async () => {
    LocalStorageUtils.getMultipleValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue([]);
    for (let i = 0; i < UserPreferencesMenuItems.length; i++) {
      const menuButtonAriaLabel =
        dataTestIdButton.menuPreFix + UserPreferencesMenuItems[i].icon;
      const pageAriaLabel = UserPreferencesMenuItems[i].nextScreen + '-page';
      await act(async () => {
        await userEvent.click(screen.getByLabelText(menuButtonAriaLabel));
      });
      expect(await screen.findByLabelText(pageAriaLabel)).toBeInTheDocument();
      await act(async () => {
        await userEvent.click(screen.getByLabelText(dataTestIdIcon.arrowBack));
      });
    }
  });
});
