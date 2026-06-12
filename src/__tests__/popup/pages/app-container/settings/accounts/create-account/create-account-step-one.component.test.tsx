import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import React from 'react';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';
import { CreateAccountStepOneComponent } from 'src/popup/hive/pages/app-container/settings/accounts/create-account/create-account-step-one/create-account-step-one.component';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import HiveUtils from 'src/popup/hive/utils/hive.utils';

describe('create-account-step-one.component tests:\n', () => {
  beforeEach(() => {
    jest.spyOn(HiveUtils, 'getAccountPrice').mockResolvedValue(3);
    jest.spyOn(AccountUtils, 'getExtendedAccount').mockResolvedValue({
      pending_claimed_accounts: 0,
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('selects the first Hive account when no active Hive account is available', async () => {
    customRender(<CreateAccountStepOneComponent />, {
      initialState: {
        ...initialStates.iniStateAs.defaultExistent,
        hive: {
          ...initialStates.iniStateAs.defaultExistent.hive,
          activeAccount: {
            ...initialStates.iniStateAs.defaultExistent.hive.activeAccount,
            name: undefined,
          },
        },
      },
    });

    await waitFor(() => {
      expect(
        screen.getByText(`@${accounts.local.one.name}`),
      ).toBeInTheDocument();
    });

    expect(screen.queryByText('@undefined')).not.toBeInTheDocument();
    expect(AccountUtils.getExtendedAccount).toHaveBeenCalledWith(
      accounts.local.one.name,
    );
  });
});
