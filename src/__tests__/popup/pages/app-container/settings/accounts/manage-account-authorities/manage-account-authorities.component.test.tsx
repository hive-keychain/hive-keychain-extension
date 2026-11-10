import AccountUtils from '@popup/hive/utils/account.utils';
import '@testing-library/jest-dom';
import { cleanup, screen, waitFor } from '@testing-library/react';
import React from 'react';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';
import { Screen } from 'src/interfaces/screen.interface';
import { ManageAccountAuthoritiesComponent } from 'src/popup/hive/pages/app-container/settings/accounts/manage-account-authorities/manage-account-authorities.component';

describe('manage-account-authorities.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it('uses the loaded active account without fetching it again', async () => {
    const getExtendedAccountSpy = jest.spyOn(AccountUtils, 'getExtendedAccount');
    const getRCManaSpy = jest.spyOn(AccountUtils, 'getRCMana');

    const { container } = customRender(<ManageAccountAuthoritiesComponent />, {
      initialState: {
        ...initialStates.iniStateAs.defaultExistent,
        hive: {
          ...initialStates.iniStateAs.defaultExistent.hive,
          activeAccount: accounts.active,
        },
      },
    });

    expect(
      screen.getByTestId(`${Screen.SETTINGS_MANAGE_ACCOUNTS_AUTHORITIES}-page`),
    ).toBeInTheDocument();
    expect(container.querySelector('.loading-container')).not.toBeInTheDocument();
    expect(await screen.findByText('theghost1980')).toBeInTheDocument();

    await waitFor(() => {
      expect(getExtendedAccountSpy).not.toHaveBeenCalled();
      expect(getRCManaSpy).not.toHaveBeenCalled();
    });
  });
});
