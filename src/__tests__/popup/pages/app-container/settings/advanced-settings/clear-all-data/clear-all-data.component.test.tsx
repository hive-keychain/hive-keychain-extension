import App from '@popup/App';
import { Icons } from '@popup/icons.enum';
import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import AccountUtils from 'src/utils/account.utils';
import ActiveAccountUtils from 'src/utils/active-account.utils';
import MkUtils from 'src/utils/mk.utils';
describe('clear-all-data.component tests:\n', () => {
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
        screen.getByLabelText(dataTestIdButton.menuPreFix + Icons.SETTINGS),
      );
      await userEvent.click(
        screen.getByLabelText(dataTestIdButton.menuPreFix + Icons.CLEAR),
      );
    });
  });
  it('Must show page and message', () => {
    expect(
      screen.getByLabelText(`${Screen.SETTINGS_CLEAR_ALL_DATA}-page`),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        chrome.i18n.getMessage('popup_html_clear_all_data_desc'),
        { exact: true },
      ),
    ).toBeInTheDocument();
  });

  it('Must go back when pressing cancel', async () => {
    await act(async () => {
      await userEvent.click(
        screen.getByLabelText(dataTestIdButton.dialog.cancel),
      );
    });
    expect(
      screen.getByLabelText(`${Screen.SETTINGS_ADVANCED}-page`),
    ).toBeInTheDocument();
  });

  it('Must clear user data and go to sign up page', async () => {
    AccountUtils.getAccount = jest.fn().mockResolvedValue([]);
    AccountUtils.getAccountsFromLocalStorage = jest.fn().mockResolvedValue([]);
    MkUtils.getMkFromLocalStorage = jest.fn().mockResolvedValue('');
    ActiveAccountUtils.getActiveAccountNameFromLocalStorage = jest
      .fn()
      .mockResolvedValue('');
    AccountUtils.hasStoredAccounts = jest.fn().mockResolvedValue(false);

    await act(async () => {
      await userEvent.click(
        screen.getByLabelText(dataTestIdButton.dialog.confirm),
      );
    });
    expect(await screen.findByLabelText('signup-page')).toBeInTheDocument();
  });
});
