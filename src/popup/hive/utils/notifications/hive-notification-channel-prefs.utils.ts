import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

export interface HiveNotificationChannelPref {
  browser: boolean;
}

export type HiveNotificationAccountChannelPrefs = Record<
  string,
  HiveNotificationChannelPref
>;

export type HiveNotificationChannelPrefsByAccount = Record<
  string,
  HiveNotificationAccountChannelPrefs
>;

const DEFAULT_CHANNEL_PREF: HiveNotificationChannelPref = {
  browser: true,
};

const normalizeUsername = (username: string) => username.trim().toLowerCase();

const normalizePref = (
  pref?: Partial<HiveNotificationChannelPref> | null,
): HiveNotificationChannelPref => ({
  browser: pref?.browser ?? DEFAULT_CHANNEL_PREF.browser,
});

const getAllChannelPrefs =
  async (): Promise<HiveNotificationChannelPrefsByAccount> => {
    const prefs = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.HIVE_NOTIFICATION_CHANNEL_PREFS,
    );
    return prefs ?? {};
  };

const getAccountChannelPrefs = async (
  username: string,
): Promise<HiveNotificationAccountChannelPrefs> => {
  const allPrefs = await getAllChannelPrefs();
  const accountPrefs = allPrefs[normalizeUsername(username)] ?? {};
  return Object.fromEntries(
    Object.entries(accountPrefs).map(([operation, pref]) => [
      operation,
      normalizePref(pref),
    ]),
  );
};

const getOperationChannelPref = async (
  username: string,
  operation: string,
): Promise<HiveNotificationChannelPref> => {
  const accountPrefs = await getAccountChannelPrefs(username);
  return accountPrefs[operation] ?? { ...DEFAULT_CHANNEL_PREF };
};

const isBrowserEnabledForOperation = async (
  username: string,
  operation: string,
): Promise<boolean> => {
  const pref = await getOperationChannelPref(username, operation);
  return pref.browser;
};

const setOperationChannelPref = async (
  username: string,
  operation: string,
  updates: Partial<HiveNotificationChannelPref>,
): Promise<HiveNotificationChannelPref> => {
  const accountKey = normalizeUsername(username);
  const allPrefs = await getAllChannelPrefs();
  const accountPrefs = allPrefs[accountKey] ?? {};
  const currentPref = normalizePref(accountPrefs[operation]);
  const nextPref: HiveNotificationChannelPref = {
    ...currentPref,
    ...updates,
  };

  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.HIVE_NOTIFICATION_CHANNEL_PREFS,
    {
      ...allPrefs,
      [accountKey]: {
        ...accountPrefs,
        [operation]: nextPref,
      },
    },
  );

  return nextPref;
};

export const HiveNotificationChannelPrefsUtils = {
  DEFAULT_CHANNEL_PREF,
  getAllChannelPrefs,
  getAccountChannelPrefs,
  getOperationChannelPref,
  isBrowserEnabledForOperation,
  setOperationChannelPref,
};
