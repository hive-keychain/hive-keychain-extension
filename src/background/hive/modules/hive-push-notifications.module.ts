import {
  getPeakDNotificationsPushUrl,
  PeakDNotificationsApi,
} from '@api/peakd-notifications';
import BgdAccountsUtils from '@background/hive/utils/accounts.utils';
import { BackgroundMessage } from '@background/multichain/background-message.interface';
import { NotificationConfig } from '@interfaces/notifications.interface';
import { DynamicGlobalPropertiesUtils } from '@popup/hive/utils/dynamic-global-properties.utils';
import {
  PeakDRawNotification,
  PeakDNotificationContentUtils,
} from '@popup/hive/utils/notifications/peakd-notification-content.utils';
import { PeakDNotificationsUtils } from '@popup/hive/utils/notifications/peakd-notifications.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { VaultKey } from '@reference-data/vault-message-key.enum';
import { I18nUtils } from 'src/utils/i18n.utils';
import Logger from 'src/utils/logger.utils';
import VaultUtils from 'src/utils/vault.utils';

const NOTIFICATION_ID_PREFIX = 'hive-push';
const HIVE_USERNAME_REGEX = /^[a-z0-9.-]{3,16}$/;

type PushNotificationTarget = {
  txUrl?: string;
  externalUrl?: string;
  linkUrl?: string;
};

let initialized = false;
let syncVersion = 0;
let globalPropertiesPromise:
  | ReturnType<typeof DynamicGlobalPropertiesUtils.getDynamicGlobalProperties>
  | undefined;
const eventSources = new Map<string, EventSource>();
const accountConfigs = new Map<string, NotificationConfig>();
const seenNotificationIds = new Set<string>();
const notificationTargets = new Map<string, PushNotificationTarget>();

const getNotificationDedupKey = (username: string, notificationId: string) =>
  `${username}:${notificationId}`;

const getNotificationId = (username: string, notificationId: string) =>
  `${NOTIFICATION_ID_PREFIX}:${username}:${notificationId}`;

const getGlobalProperties = () => {
  if (!globalPropertiesPromise) {
    globalPropertiesPromise =
      DynamicGlobalPropertiesUtils.getDynamicGlobalProperties().catch(
        (error) => {
          globalPropertiesPromise = undefined;
          throw error;
        },
      );
  }
  return globalPropertiesPromise;
};

const closeEventSource = (username: string) => {
  eventSources.get(username)?.close();
  eventSources.delete(username);
  accountConfigs.delete(username);
};

const disconnect = () => {
  for (const username of [...eventSources.keys()]) {
    closeEventSource(username);
  }
  accountConfigs.clear();
};

const isPushNotificationPayload = (
  payload: unknown,
): payload is PeakDRawNotification => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return false;
  }
  const value = payload as Partial<PeakDRawNotification>;
  return (
    typeof value.id === 'string' &&
    value.id.length > 0 &&
    typeof value.payload === 'string' &&
    typeof value.operation_type === 'string' &&
    value.operation_type.length > 0
  );
};

const getAccountsWithNotificationConfig = async (usernames: string[]) => {
  const configuredAccounts: string[] = [];
  await Promise.all(
    usernames.map(async (username) => {
      try {
        const userConfig = await PeakDNotificationsApi.get(`users/${username}`);
        if (userConfig) {
          configuredAccounts.push(username);
          accountConfigs.set(
            username,
            Array.isArray(userConfig.config) ? userConfig.config : [],
          );
        }
      } catch {
        Logger.warn(
          `Unable to load PeakD notification config for @${username}`,
        );
      }
    }),
  );
  return configuredAccounts;
};

const handlePushNotification = async (
  username: string,
  rawNotification: PeakDRawNotification,
) => {
  const dedupKey = getNotificationDedupKey(username, rawNotification.id);
  if (seenNotificationIds.has(dedupKey)) {
    return;
  }
  seenNotificationIds.add(dedupKey);

  const operation =
    PeakDNotificationContentUtils.getPeakDOperationName(rawNotification);
  const config = accountConfigs.get(username) ?? [];
  if (
    !PeakDNotificationsUtils.isPushNotificationEnabledForOperation(
      config,
      operation,
    )
  ) {
    return;
  }

  const globalProperties = await getGlobalProperties();
  const content = PeakDNotificationContentUtils.formatRawPeakDNotificationContent(
    rawNotification,
    username,
    globalProperties,
  );
  const notificationId = getNotificationId(username, rawNotification.id);
  notificationTargets.set(notificationId, {
    txUrl: content.txUrl,
    externalUrl: content.externalUrl,
    linkUrl: content.linkUrl,
  });

  chrome.notifications.create(notificationId, {
    type: 'basic',
    iconUrl: '/assets/images/iconhive.png',
    title: I18nUtils.getMessage('hive_push_notification_title', [
      `@${username}`,
    ]),
    message: I18nUtils.getMessage(content.message, content.messageParams),
    priority: 0,
  });
};

const connectAccount = (username: string) => {
  if (eventSources.has(username)) {
    return;
  }

  const eventSource = new EventSource(getPeakDNotificationsPushUrl(username));
  eventSource.onmessage = ({ data }) => {
    void (async () => {
      try {
        const notification = JSON.parse(data);
        if (!isPushNotificationPayload(notification)) {
          Logger.warn('Ignored invalid Hive push notification payload');
          return;
        }
        await handlePushNotification(username, notification);
      } catch (error) {
        Logger.warn(
          `Unable to display Hive push notification: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    })();
  };
  eventSource.onerror = () => {
    Logger.warn(`Hive push notification stream error for @${username}`);
  };
  eventSources.set(username, eventSource);
};

const syncConnectionWithWalletState = async () => {
  const currentSyncVersion = ++syncVersion;
  try {
    const mk = await VaultUtils.getValueFromVault(VaultKey.__MK);
    if (currentSyncVersion !== syncVersion) {
      return;
    }
    if (!mk) {
      disconnect();
      return;
    }

    const accounts = await BgdAccountsUtils.getAccountsFromLocalStorage(mk);
    if (currentSyncVersion !== syncVersion) {
      return;
    }

    const usernames = [
      ...new Set(
        (accounts ?? [])
          .map((account) => account.name?.trim().toLowerCase())
          .filter(
            (username): username is string =>
              !!username && HIVE_USERNAME_REGEX.test(username),
          ),
      ),
    ];
    if (usernames.length === 0) {
      disconnect();
      return;
    }

    const configuredAccounts =
      await getAccountsWithNotificationConfig(usernames);
    if (currentSyncVersion !== syncVersion) {
      return;
    }

    const configuredAccountSet = new Set(configuredAccounts);
    for (const username of [...eventSources.keys()]) {
      if (!configuredAccountSet.has(username)) {
        closeEventSource(username);
      }
    }

    if (configuredAccounts.length === 0) {
      disconnect();
      return;
    }

    for (const username of configuredAccounts) {
      connectAccount(username);
    }
  } catch (error) {
    if (currentSyncVersion !== syncVersion) {
      return;
    }
    disconnect();
    Logger.warn(
      `Unable to sync Hive push notification subscriptions: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

const isInternalSender = (sender: chrome.runtime.MessageSender) =>
  sender.id === chrome.runtime.id;

const onRuntimeMessage = (
  message: BackgroundMessage,
  sender: chrome.runtime.MessageSender,
) => {
  if (!isInternalSender(sender)) {
    return;
  }
  if (message.command === BackgroundCommand.VAULT_LOADED) {
    globalPropertiesPromise = undefined;
    void syncConnectionWithWalletState();
    return;
  }
  if (message.command === BackgroundCommand.SYNC_HIVE_PUSH_NOTIFICATIONS) {
    const payload = message.value as
      | {
          username?: string;
          config?: NotificationConfig;
          deleted?: boolean;
        }
      | undefined;
    const username = payload?.username?.trim().toLowerCase();
    if (username && HIVE_USERNAME_REGEX.test(username)) {
      if (payload?.deleted) {
        closeEventSource(username);
      } else if (Array.isArray(payload?.config)) {
        accountConfigs.set(username, payload.config);
        connectAccount(username);
      }
    }
  }
};

const onStorageChanged = (
  changes: Record<string, chrome.storage.StorageChange>,
  areaName: string,
) => {
  if (
    areaName === 'local' &&
    changes[LocalStorageKeyEnum.ACCOUNTS] !== undefined
  ) {
    void syncConnectionWithWalletState();
  }
};

const openNotificationTarget = (target: PushNotificationTarget) => {
  if (target.txUrl) {
    chrome.tabs.create({ url: target.txUrl });
    return;
  }
  if (target.externalUrl) {
    chrome.tabs.create({ url: target.externalUrl });
    return;
  }
  if (target.linkUrl) {
    chrome.tabs.create({ url: target.linkUrl });
  }
};

const onNotificationClicked = (notificationId: string) => {
  if (!notificationId.startsWith(`${NOTIFICATION_ID_PREFIX}:`)) {
    return;
  }
  const target = notificationTargets.get(notificationId);
  if (target) {
    openNotificationTarget(target);
    notificationTargets.delete(notificationId);
  }
};

const start = () => {
  if (initialized) {
    return;
  }
  initialized = true;
  VaultUtils.addWalletLockStateListener(() => {
    globalPropertiesPromise = undefined;
    void syncConnectionWithWalletState();
  });
  chrome.runtime.onMessage.addListener(onRuntimeMessage);
  chrome.storage.onChanged.addListener(onStorageChanged);
  chrome.notifications.onClicked.addListener(onNotificationClicked);
  void syncConnectionWithWalletState();
};

export const HivePushNotificationsModule = {
  start,
};
