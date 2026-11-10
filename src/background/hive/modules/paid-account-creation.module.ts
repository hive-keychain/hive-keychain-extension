import MkModule from '@background/hive/modules/mk.module';
import { ExtensionUiLifecycle } from '@background/multichain/extension-ui.lifecycle';
import { SidePanelToolbarLifecycle } from '@background/multichain/side-panel-toolbar.lifecycle';
import { PaidAccountCreationNotificationsUtils } from '@popup/hive/utils/paid-account-creation-notifications.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import Config from 'src/config';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import { PaidAccountCreationSyncUtils } from 'src/utils/paid-account-creation-sync.utils';
import { PendingHiveAccountCreationUtils } from 'src/utils/pending-hive-account-creation.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

const PAID_ACCOUNT_CREATION_ALARM = 'paid_hive_account_creation_sync';

const isExtensionUiOpen = (): boolean =>
  ExtensionUiLifecycle.hasConnectedExtensionUiPort() ||
  SidePanelToolbarLifecycle.hasConnectedSidePanelPort();

const hasPendingAccountCreations = async (mk: string): Promise<boolean> => {
  try {
    const pendingRequests =
      await PendingHiveAccountCreationUtils.getPendingHiveAccountCreationRequests(
        mk,
      );
    return PaidAccountCreationSyncUtils.hasPendingHiveAccountCreationsAwaitingSync(
      pendingRequests,
    );
  } catch {
    return false;
  }
};

const notifyCompletedAccountCreations = async (
  results: Awaited<
    ReturnType<
      typeof PaidAccountCreationSyncUtils.synchronizePendingHiveAccountCreationRequests
    >
  >,
): Promise<void> => {
  for (const result of results) {
    if (
      (result.outcome !== 'imported' &&
        result.outcome !== 'already_imported') ||
      !result.account ||
      !result.request
    ) {
      continue;
    }

    await PaidAccountCreationNotificationsUtils.showAccountCreatedNotification(
      result.account.name,
      result.request.requestId,
    );
  }
};

const synchronizePendingAccountCreationsInBackground = async (): Promise<void> => {
  if (isExtensionUiOpen()) {
    return;
  }

  const mk = await MkModule.getMk();
  if (!mk) {
    return;
  }

  let accounts = (await AccountUtils.getAccountsFromLocalStorage(mk)) ?? [];
  const results =
    await PaidAccountCreationSyncUtils.synchronizePendingHiveAccountCreationRequests(
      mk,
      () => accounts,
      async (updatedAccounts) => {
        accounts = updatedAccounts;
        await AccountUtils.saveAccounts(updatedAccounts, mk);
      },
      (requestId, error) => {
        Logger.error(
          `Unable to synchronize pending Hive account creation ${requestId}`,
          error,
        );
      },
    );

  await notifyCompletedAccountCreations(results);
};

const syncAlarmIfNeeded = async (): Promise<void> => {
  const mk = await MkModule.getMk();
  if (!mk || !(await hasPendingAccountCreations(mk))) {
    await chrome.alarms.clear(PAID_ACCOUNT_CREATION_ALARM);
    return;
  }

  const alarm = await chrome.alarms.get(PAID_ACCOUNT_CREATION_ALARM);
  if (!alarm) {
    await chrome.alarms.create(PAID_ACCOUNT_CREATION_ALARM, {
      periodInMinutes: Config.paidAccountCreation.SYNC_FREQUENCY_MINUTES,
    });
  }

  await synchronizePendingAccountCreationsInBackground();
};

const start = (): void => {
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name !== PAID_ACCOUNT_CREATION_ALARM) {
      return;
    }

    void synchronizePendingAccountCreationsInBackground().then(() =>
      syncAlarmIfNeeded(),
    );
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local') {
      return;
    }

    if (changes[LocalStorageKeyEnum.PENDING_HIVE_ACCOUNT_CREATIONS]) {
      void syncAlarmIfNeeded();
    }
  });

  void syncAlarmIfNeeded();
};

export const PaidAccountCreationModule = {
  start,
  synchronizePendingAccountCreationsInBackground,
  notifyCompletedAccountCreations,
};
