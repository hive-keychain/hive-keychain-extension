import App from '@popup/App';
import { Icons } from '@popup/icons.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdCheckbox from 'src/__tests__/utils-for-testing/data-testid/data-testid-checkbox';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import LocalStorageUtils from 'src/utils/localStorage.utils';
describe('keychainify.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  beforeEach(async () => {
    await reactTestingLibrary.renderWithConfiguration(
      <App />,
      initialStates.iniStateAs.defaultExistent,
      {
        app: {
          ledgerRelated: {
            LedgerUtils: {
              isLedgerSupported: true,
            },
          },
        },
      },
    );
    await act(async () => {
      await userEvent.click(screen.getByTestId(dataTestIdButton.menu));
      await userEvent.click(
        screen.getByTestId(dataTestIdButton.menuPreFix + Icons.SETTINGS),
      );
      await userEvent.click(
        screen.getByTestId(dataTestIdButton.menuPreFix + Icons.LINK),
      );
    });
  });
  it('Must load component and match show intro message', () => {
    expect(
      screen.getByTestId(`${Screen.SETTINGS_KEYCHAINIFY}-page`),
    ).toBeInTheDocument();
    expect(
      screen.getByText(chrome.i18n.getMessage('popup_html_keychainify_text'), {
        exact: true,
      }),
    ).toBeInTheDocument();
  });

  it('Must call saveValueInLocalStorage', async () => {
    const sSaveValueInLocalStorage = jest.spyOn(
      LocalStorageUtils,
      'saveValueInLocalStorage',
    );
    await act(async () => {
      await userEvent.click(
        screen.getByTestId(dataTestIdCheckbox.keychainify.checkbox),
      );
    });
    expect(sSaveValueInLocalStorage.mock.lastCall[0]).toBe(
      LocalStorageKeyEnum.KEYCHAINIFY_ENABLED,
    );
    sSaveValueInLocalStorage.mockRestore();
  });
});
