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
import UserPreferencesMenuItems from 'src/popup/hive/pages/app-container/settings/user-preferences/user-preferences-menu-items';
import LocalStorageUtils from 'src/utils/localStorage.utils';
describe('user-preferences.component tests:\n', () => {
  beforeEach(async () => {
    await reactTestingLibrary.renderWithConfiguration(
      <HiveAppComponent />,
      initialStates.iniStateAs.defaultExistent,
    );
    await act(async () => {
      await userEvent.click(screen.getByTestId(dataTestIdButton.menu));
      await userEvent.click(
        screen.getByTestId(dataTestIdButton.menuPreFix + Icons.PREFERENCES),
      );
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  it('Must load each menu items', () => {
    const items = UserPreferencesMenuItems(() => {});
    items.forEach((item) => {
      expect(screen.getByTestId(dataTestIdButton.menuPreFix + item.icon));
    });
  });
  it('Must open each menu item', async () => {
    LocalStorageUtils.getMultipleValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue([]);
    const items = UserPreferencesMenuItems(() => {});
    for (let i = 0; i < items.length; i++) {
      const menuButtonAriaLabel =
        dataTestIdButton.menuPreFix + items[i].icon;
      const pageAriaLabel = items[i].nextScreen + '-page';
      await act(async () => {
        await userEvent.click(screen.getByTestId(menuButtonAriaLabel));
      });
      expect(await screen.findByTestId(pageAriaLabel)).toBeInTheDocument();
      await act(async () => {
        await userEvent.click(screen.getByTestId(dataTestIdIcon.arrowBack));
      });
    }
  });
});
