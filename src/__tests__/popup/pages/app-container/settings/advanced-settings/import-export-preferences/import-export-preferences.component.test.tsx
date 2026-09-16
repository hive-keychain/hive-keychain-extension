import AccountUtils from '@hiveapp/utils/account.utils';
import { Screen } from '@interfaces/screen.interface';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { Icons } from 'src/common-ui/icons.enum';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';
import ImportAccountsFileUtils from 'src/popup/hive/utils/import-accounts-file.utils';
import { I18nUtils } from 'src/utils/i18n.utils';

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
      {
        navigateToAfterMount: Screen.SETTINGS_IMPORT_EXPORT,
      },
    );
  });
  it('Must load import-export page and show info', () => {
    expect(
      screen.getByTestId(`${Screen.SETTINGS_IMPORT_EXPORT}-page`),
    ).toBeInTheDocument();
    expect(
      screen.getByText(I18nUtils.getMessage('popup_html_import_permissions'), {
        exact: true,
      }),
    ).toBeInTheDocument();
  });

  it('Must open the accounts import flow', async () => {
    const startImportSpy = jest
      .spyOn(ImportAccountsFileUtils, 'startImportAccountsFromFile')
      .mockImplementation(() => undefined);
    await act(async () => {
      await userEvent.click(
        screen.getByTestId(dataTestIdButton.menuPreFix + Icons.IMPORT),
      );
    });
    expect(startImportSpy).toHaveBeenCalledTimes(1);
    startImportSpy.mockRestore();
  });

  it('Must export the encrypted accounts backup', async () => {
    const downloadAccountsSpy = jest
      .spyOn(AccountUtils, 'downloadAccounts')
      .mockImplementation(() => Promise.resolve(undefined));
    await act(async () => {
      await userEvent.click(
        screen.getByTestId(dataTestIdButton.menuPreFix + Icons.EXPORT),
      );
    });
    expect(downloadAccountsSpy).toHaveBeenCalledTimes(1);
    downloadAccountsSpy.mockRestore();
  });
});
