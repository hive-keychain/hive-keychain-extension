import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { Icons } from 'src/common-ui/icons.enum';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import SettingsUtils from 'src/utils/settings.utils';
describe('import-export-preferences.component tests:\n', () => {
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
        screen.getByTestId(dataTestIdButton.menuPreFix + Icons.SETTINGS),
      );
      await userEvent.click(
        screen.getByTestId(dataTestIdButton.menuPreFix + Icons.IMPORT_EXPORT),
      );
    });
  });
  it('Must load import-export page and show info', () => {
    expect(
      screen.getByTestId(`${Screen.SETTINGS_IMPORT_EXPORT}-page`),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        chrome.i18n.getMessage('popup_html_import_permissions'),
        { exact: true },
      ),
    ).toBeInTheDocument();
  });

  it('Must open import window', async () => {
    const sImportSettings = jest.spyOn(SettingsUtils, 'importSettings');
    await act(async () => {
      await userEvent.click(
        screen.getByTestId(dataTestIdButton.menuPreFix + Icons.IMPORT),
      );
    });
    expect(sImportSettings).toHaveBeenCalledTimes(1);
    sImportSettings.mockRestore();
  });

  it('Must try to export settings file', async () => {
    window.URL.createObjectURL = jest
      .fn()
      .mockImplementation((...args: any) => args);
    const sExportSettings = jest.spyOn(SettingsUtils, 'exportSettings');
    const sClick = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
    LocalStorageUtils.getMultipleValueFromLocalStorage = jest
      .fn()
      .mockResolvedValueOnce(null);
    await act(async () => {
      await userEvent.click(
        screen.getByTestId(dataTestIdButton.menuPreFix + Icons.EXPORT),
      );
    });
    expect(sExportSettings).toHaveBeenCalledTimes(1);
    expect(sClick).toHaveBeenCalledTimes(1);
    sExportSettings.mockRestore();
    sClick.mockRestore();
  });
});
