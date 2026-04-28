import {
  EvmOnlyHivePromotionEligibilityInput,
  EvmOnlyHivePromotionStorage,
  GetEvmOnlyHivePromotionEligibilityOptions,
} from '@interfaces/hive-promotion.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import EncryptUtils from 'src/popup/hive/utils/encrypt.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { PendingHiveAccountCreationUtils } from 'src/utils/pending-hive-account-creation.utils';

const DEFAULT_HIVE_PROMOTION_MIN_INSTALL_AGE_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

const getHivePromotionMinInstallAgeDays = () => {
  const configuredDays = Number(
    process.env.HIVE_PROMOTION_MIN_INSTALL_AGE_DAYS,
  );
  return Number.isFinite(configuredDays) && configuredDays > 0
    ? configuredDays
    : DEFAULT_HIVE_PROMOTION_MIN_INSTALL_AGE_DAYS;
};

const getTime = (date: string | number | Date | null | undefined) => {
  if (!date) return NaN;
  return date instanceof Date ? date.getTime() : new Date(date).getTime();
};

const isOldEnough = (
  installDate: EvmOnlyHivePromotionEligibilityInput['installDate'],
  now: Date,
) => {
  const installTime = getTime(installDate);
  return (
    Number.isFinite(installTime) &&
    now.getTime() - installTime >= getHivePromotionMinInstallAgeDays() * DAY_MS
  );
};

const isSnoozed = (
  snoozedUntil: EvmOnlyHivePromotionStorage['snoozedUntil'],
  now: Date,
) => {
  const snoozedUntilTime = getTime(snoozedUntil);
  return Number.isFinite(snoozedUntilTime) && snoozedUntilTime > now.getTime();
};

const shouldShowEvmOnlyHivePromotion = ({
  installDate,
  evmAccountsCount,
  hiveAccountsCount,
  pendingHiveAccountCreationCount,
  dismissedPermanently,
  snoozedUntil,
  walletUnlocked,
  sensitiveFlowActive,
  now = new Date(),
}: EvmOnlyHivePromotionEligibilityInput) => {
  return true;
  // isOldEnough(installDate, now)
  // evmAccountsCount > 0 &&
  // hiveAccountsCount === 0 &&
  // pendingHiveAccountCreationCount === 0 &&
  // !dismissedPermanently &&
  // !isSnoozed(snoozedUntil, now) &&
  // walletUnlocked &&
  // !sensitiveFlowActive
};

const getEvmOnlyHivePromotionStorage =
  async (): Promise<EvmOnlyHivePromotionStorage> => {
    const storedValue = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_ONLY_HIVE_PROMOTION,
    );
    return storedValue ?? {};
  };

const saveEvmOnlyHivePromotionStorage = async (
  storage: EvmOnlyHivePromotionStorage,
) => {
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_ONLY_HIVE_PROMOTION,
    storage,
  );
};

const dismissEvmOnlyHivePromotionPermanently = async () => {
  const storage = await getEvmOnlyHivePromotionStorage();
  await saveEvmOnlyHivePromotionStorage({
    ...storage,
    dismissedPermanently: true,
  });
};

const snoozeEvmOnlyHivePromotion = async (snoozedUntil: string | Date) => {
  const storage = await getEvmOnlyHivePromotionStorage();
  await saveEvmOnlyHivePromotionStorage({
    ...storage,
    snoozedUntil:
      snoozedUntil instanceof Date ? snoozedUntil.toISOString() : snoozedUntil,
  });
};

const setEvmOnlyHivePromotionLastShown = async (lastShownAt = new Date()) => {
  const storage = await getEvmOnlyHivePromotionStorage();
  await saveEvmOnlyHivePromotionStorage({
    ...storage,
    lastShownAt: lastShownAt.toISOString(),
  });
};

const getOrInitializeKeychainInstallDate = async (now = new Date()) => {
  const installDate = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.KEYCHAIN_INSTALL_DATE,
  );

  if (Number.isFinite(getTime(installDate))) {
    return installDate as string;
  }

  const initializedInstallDate = now.toISOString();
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.KEYCHAIN_INSTALL_DATE,
    initializedInstallDate,
  );
  return initializedInstallDate;
};

const getEncryptedListCount = async (
  key: LocalStorageKeyEnum,
  mk: string,
  withLegacySupport = false,
) => {
  try {
    const encryptedValue =
      await LocalStorageUtils.getValueFromLocalStorage(key);
    const decryptedValue = withLegacySupport
      ? await EncryptUtils.decryptToJsonWithLegacySupport(encryptedValue, mk)
      : await EncryptUtils.decryptToJson(encryptedValue, mk);
    return Array.isArray(decryptedValue?.list) ? decryptedValue.list.length : 0;
  } catch (error) {
    return 0;
  }
};

const getEvmOnlyHivePromotionEligibility = async ({
  mk,
  walletUnlocked,
  sensitiveFlowActive,
  now = new Date(),
}: GetEvmOnlyHivePromotionEligibilityOptions) => {
  const installDate = await getOrInitializeKeychainInstallDate(now);
  const storage = await getEvmOnlyHivePromotionStorage();

  if (!walletUnlocked || !mk) {
    return shouldShowEvmOnlyHivePromotion({
      installDate,
      evmAccountsCount: 0,
      hiveAccountsCount: 0,
      pendingHiveAccountCreationCount: 0,
      walletUnlocked: false,
      sensitiveFlowActive,
      now,
      ...storage,
    });
  }

  const [evmAccountsCount, hiveAccountsCount, pendingRequests] =
    await Promise.all([
      getEncryptedListCount(LocalStorageKeyEnum.EVM_ACCOUNTS, mk, true),
      getEncryptedListCount(LocalStorageKeyEnum.ACCOUNTS, mk),
      PendingHiveAccountCreationUtils.getPendingHiveAccountCreationRequests(
        mk,
      ).catch(() => []),
    ]);

  return shouldShowEvmOnlyHivePromotion({
    installDate,
    evmAccountsCount,
    hiveAccountsCount,
    pendingHiveAccountCreationCount: pendingRequests.length,
    walletUnlocked,
    sensitiveFlowActive,
    now,
    ...storage,
  });
};

export const EvmOnlyHivePromotionUtils = {
  shouldShowEvmOnlyHivePromotion,
  getEvmOnlyHivePromotionEligibility,
  getEvmOnlyHivePromotionStorage,
  dismissEvmOnlyHivePromotionPermanently,
  snoozeEvmOnlyHivePromotion,
  setEvmOnlyHivePromotionLastShown,
  getOrInitializeKeychainInstallDate,
};
