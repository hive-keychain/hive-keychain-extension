import { waitFor } from '@testing-library/react';
import { PaidAccountCreationModule } from '@background/hive/modules/paid-account-creation.module';
import MkModule from '@background/hive/modules/mk.module';
import { ExtensionUiLifecycle } from '@background/multichain/extension-ui.lifecycle';
import { SidePanelToolbarLifecycle } from '@background/multichain/side-panel-toolbar.lifecycle';
import { PendingHiveAccountCreationRequest } from '@interfaces/hive-account-creation.interface';
import { PaidAccountCreationNotificationsUtils } from '@popup/hive/utils/paid-account-creation-notifications.utils';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import { PaidAccountCreationSyncUtils } from 'src/utils/paid-account-creation-sync.utils';
import { PendingHiveAccountCreationUtils } from 'src/utils/pending-hive-account-creation.utils';

describe('paid-account-creation.module', () => {
  const pendingRequest: PendingHiveAccountCreationRequest = {
    requestId: 'request-1',
    username: 'new-account',
    encryptedAccount: 'encrypted',
    paymentCurrency: 'EVM:1:native',
    paymentAddress: '0x1111111111111111111111111111111111111111',
    amount: '0.001',
    expiresAt: '2026-04-28T01:00:00.000Z',
    status: 'account_created',
    createdAt: '2026-04-28T00:00:00.000Z',
    updatedAt: '2026-04-28T00:00:00.000Z',
  };

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(ExtensionUiLifecycle, 'hasConnectedExtensionUiPort').mockReturnValue(false);
    jest
      .spyOn(SidePanelToolbarLifecycle, 'hasConnectedSidePanelPort')
      .mockReturnValue(false);
    jest.spyOn(MkModule, 'getMk').mockResolvedValue(mk.user.one);
    jest.spyOn(AccountUtils, 'getAccountsFromLocalStorage').mockResolvedValue([]);
    jest.spyOn(AccountUtils, 'saveAccounts').mockResolvedValue();
    jest
      .spyOn(PaidAccountCreationNotificationsUtils, 'showAccountCreatedNotification')
      .mockResolvedValue();
    jest.spyOn(chrome.alarms, 'clear').mockResolvedValue(true);
    jest.spyOn(chrome.alarms, 'get').mockResolvedValue(undefined);
    jest.spyOn(chrome.alarms, 'create').mockResolvedValue(undefined);
  });

  it('keeps syncing account_created requests until they are imported', async () => {
    jest
      .spyOn(
        PendingHiveAccountCreationUtils,
        'getPendingHiveAccountCreationRequests',
      )
      .mockResolvedValue([pendingRequest]);
    jest
      .spyOn(
        PaidAccountCreationSyncUtils,
        'synchronizePendingHiveAccountCreationRequests',
      )
      .mockResolvedValue([]);

    PaidAccountCreationModule.start();

    await waitFor(() => {
      expect(chrome.alarms.create).toHaveBeenCalled();
    });
    expect(
      PaidAccountCreationSyncUtils.synchronizePendingHiveAccountCreationRequests,
    ).toHaveBeenCalled();
  });

  it('shows a notification for background imports while the extension UI is closed', async () => {
    const importedAccount = {
      name: pendingRequest.username,
      keys: { posting: 'posting-key' },
    };
    jest
      .spyOn(
        PaidAccountCreationSyncUtils,
        'synchronizePendingHiveAccountCreationRequests',
      )
      .mockResolvedValue([
        {
          outcome: 'imported',
          account: importedAccount,
          request: pendingRequest,
        },
      ]);

    await PaidAccountCreationModule.synchronizePendingAccountCreationsInBackground();

    expect(
      PaidAccountCreationNotificationsUtils.showAccountCreatedNotification,
    ).toHaveBeenCalledWith(importedAccount.name, pendingRequest.requestId);
  });

  it('shows a notification when the account was already present locally', async () => {
    const existingAccount = {
      name: pendingRequest.username,
      keys: { posting: 'posting-key' },
    };
    jest
      .spyOn(
        PaidAccountCreationSyncUtils,
        'synchronizePendingHiveAccountCreationRequests',
      )
      .mockResolvedValue([
        {
          outcome: 'already_imported',
          account: existingAccount,
          request: pendingRequest,
        },
      ]);

    await PaidAccountCreationModule.synchronizePendingAccountCreationsInBackground();

    expect(
      PaidAccountCreationNotificationsUtils.showAccountCreatedNotification,
    ).toHaveBeenCalledWith(existingAccount.name, pendingRequest.requestId);
  });

  it('skips background synchronization while extension UI surfaces are open', async () => {
    jest
      .spyOn(ExtensionUiLifecycle, 'hasConnectedExtensionUiPort')
      .mockReturnValue(true);
    jest
      .spyOn(
        PaidAccountCreationSyncUtils,
        'synchronizePendingHiveAccountCreationRequests',
      )
      .mockResolvedValue([]);

    await PaidAccountCreationModule.synchronizePendingAccountCreationsInBackground();

    expect(
      PaidAccountCreationSyncUtils.synchronizePendingHiveAccountCreationRequests,
    ).not.toHaveBeenCalled();
  });
});
