import {
  IDENTITY_STORAGE_KEYS,
  isIdentityStorageKey,
} from '@reference-data/identity-storage-keys.list';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { VaultKey } from '@reference-data/vault-message-key.enum';
import EncryptUtils from 'src/popup/hive/utils/encrypt.utils';
import {
  getMultipleValueFromLocalStorageRaw,
  getValueFromLocalStorageRaw,
  saveValueInLocalStorageRaw,
} from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';
import VaultUtils from 'src/utils/vault.utils';

const plaintextCache = new Map<LocalStorageKeyEnum, unknown>();

const resolveMk = async (mk?: string): Promise<string | undefined> => {
  if (mk !== undefined) {
    return mk.length > 0 ? mk : undefined;
  }
  if (process.env.JEST_WORKER_ID) {
    return undefined;
  }
  try {
    const vaultMk = await VaultUtils.getValueFromVault(VaultKey.__MK);
    return typeof vaultMk === 'string' && vaultMk.length > 0
      ? vaultMk
      : undefined;
  } catch {
    return undefined;
  }
};

const unwrapEncryptedPayload = (decrypted: { list?: unknown } | null) => {
  if (!decrypted || decrypted.list === undefined || decrypted.list === null) {
    return undefined;
  }
  return decrypted.list;
};

const isMissingValue = (value: unknown) =>
  value === undefined || value === null;

const getOrCreateIdentitySalt = async (): Promise<string> => {
  const storedSalt = await getValueFromLocalStorageRaw(
    LocalStorageKeyEnum.IDENTITY_STORAGE_SALT,
  );
  if (typeof storedSalt === 'string' && storedSalt.length > 0) {
    return storedSalt;
  }

  const identityValues = await getMultipleValueFromLocalStorageRaw(
    IDENTITY_STORAGE_KEYS,
  );
  for (const value of Object.values(identityValues ?? {})) {
    if (typeof value === 'string' && EncryptUtils.isEncryptedJsonV2(value)) {
      const salt = EncryptUtils.parseEncryptedJsonV2Salt(value);
      if (salt) {
        await saveValueInLocalStorageRaw(
          LocalStorageKeyEnum.IDENTITY_STORAGE_SALT,
          salt,
        );
        return salt;
      }
    }
  }

  const salt = EncryptUtils.generateAesGcmSaltBase64();
  await saveValueInLocalStorageRaw(
    LocalStorageKeyEnum.IDENTITY_STORAGE_SALT,
    salt,
  );
  return salt;
};

const decryptStoredValue = async (
  stored: unknown,
  mk: string,
): Promise<unknown> => {
  if (typeof stored !== 'string' || !EncryptUtils.isEncryptedJsonV2(stored)) {
    return stored;
  }
  const decrypted = await EncryptUtils.decryptToJson(stored, mk);
  return unwrapEncryptedPayload(decrypted);
};

const getEncryptedJson = async (
  key: LocalStorageKeyEnum,
  mk?: string,
): Promise<any> => {
  if (!isIdentityStorageKey(key)) {
    return getValueFromLocalStorageRaw(key);
  }

  if (plaintextCache.has(key)) {
    return plaintextCache.get(key);
  }

  const stored = await getValueFromLocalStorageRaw(key);
  if (isMissingValue(stored)) {
    return stored;
  }

  const isCiphertext =
    typeof stored === 'string' && EncryptUtils.isEncryptedJsonV2(stored);

  if (!isCiphertext) {
    const resolvedMk = await resolveMk(mk);
    if (resolvedMk) {
      await saveEncryptedJson(key, stored, resolvedMk);
    }
    return stored;
  }

  const resolvedMk = await resolveMk(mk);
  if (!resolvedMk) {
    return undefined;
  }

  const decrypted = await decryptStoredValue(stored, resolvedMk);
  if (decrypted === undefined) {
    Logger.error(`Unable to decrypt identity setting: ${key}`);
    return undefined;
  }

  plaintextCache.set(key, decrypted);
  return decrypted;
};

const saveEncryptedJson = async (
  key: LocalStorageKeyEnum,
  value: unknown,
  mk?: string,
): Promise<void> => {
  if (!isIdentityStorageKey(key)) {
    await saveValueInLocalStorageRaw(key, value);
    return;
  }

  const resolvedMk = await resolveMk(mk);
  if (!resolvedMk) {
    Logger.error(`Skipping identity setting write without mk: ${key}`);
    return;
  }

  const salt = await getOrCreateIdentitySalt();
  const encrypted = await EncryptUtils.encryptJsonWithSalt(
    { list: value },
    resolvedMk,
    salt,
  );
  await saveValueInLocalStorageRaw(key, encrypted);
  plaintextCache.set(key, value);
};

const migrateIdentitySettings = async (mk: string): Promise<void> => {
  if (!mk) {
    return;
  }

  const storedValues = await getMultipleValueFromLocalStorageRaw(
    IDENTITY_STORAGE_KEYS,
  );

  for (const key of IDENTITY_STORAGE_KEYS) {
    const stored = storedValues[key];
    if (isMissingValue(stored)) {
      continue;
    }

    const isCiphertext =
      typeof stored === 'string' && EncryptUtils.isEncryptedJsonV2(stored);
    if (isCiphertext) {
      const decrypted = await decryptStoredValue(stored, mk);
      if (decrypted !== undefined) {
        plaintextCache.set(key, decrypted);
      }
      continue;
    }

    await saveEncryptedJson(key, stored, mk);
  }
};

const migrateIdentitySettingsAfterUnlock = async (
  mk: string,
): Promise<void> => {
  if (mk) {
    await migrateIdentitySettings(mk);
  }
  const localStorageModule = await import(
    '@background/hive/modules/local-storage.module'
  );
  await localStorageModule.default.checkAndUpdateLocalStorage();
};

const reencryptIdentitySettings = async (
  oldMk: string,
  newMk: string,
): Promise<void> => {
  const storedValues = await getMultipleValueFromLocalStorageRaw(
    IDENTITY_STORAGE_KEYS,
  );

  plaintextCache.clear();
  await saveValueInLocalStorageRaw(
    LocalStorageKeyEnum.IDENTITY_STORAGE_SALT,
    EncryptUtils.generateAesGcmSaltBase64(),
  );

  for (const key of IDENTITY_STORAGE_KEYS) {
    const stored = storedValues[key];
    if (isMissingValue(stored)) {
      continue;
    }
    const decrypted = await decryptStoredValue(stored, oldMk);
    if (decrypted === undefined) {
      continue;
    }
    await saveEncryptedJson(key, decrypted, newMk);
  }
};

const clearCache = () => {
  plaintextCache.clear();
  EncryptUtils.clearDerivedKeyCache();
};

const removeCachedValue = (key: LocalStorageKeyEnum) => {
  plaintextCache.delete(key);
};

if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local') {
      return;
    }
    for (const key of Object.keys(changes)) {
      if (isIdentityStorageKey(key)) {
        plaintextCache.delete(key as LocalStorageKeyEnum);
      }
    }
  });
}

const EncryptedLocalStorageUtils = {
  getEncryptedJson,
  saveEncryptedJson,
  migrateIdentitySettings,
  migrateIdentitySettingsAfterUnlock,
  reencryptIdentitySettings,
  clearCache,
  removeCachedValue,
  isIdentityStorageKey,
};

export default EncryptedLocalStorageUtils;
