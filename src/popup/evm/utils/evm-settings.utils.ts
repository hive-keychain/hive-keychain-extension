import {
  EvmProviderCompatibilitySettings,
  EvmSettings,
} from '@popup/evm/interfaces/evm-settings.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

export const DEFAULT_EVM_SETTINGS: EvmSettings = {
  smartContracts: {
    displayPossibleSpam: false,
    displayNonVerifiedContracts: false,
  },
  providerCompatibility: {
    preferOnLegacyDapps: null,
  },
};

const isStoredEvmSettings = (
  value: unknown,
): value is Partial<EvmSettings> => {
  return !!value && typeof value === 'object' && !Array.isArray(value);
};

const readPreferOnLegacyDapps = (
  settings?: Partial<EvmSettings> | null,
): boolean | null => {
  const value = settings?.providerCompatibility?.preferOnLegacyDapps;
  if (value === true || value === false || value === null) {
    return value;
  }
  return null;
};

export const normalizeEvmSettings = (
  settings?: Partial<EvmSettings> | null,
): EvmSettings => {
  return {
    ...DEFAULT_EVM_SETTINGS,
    ...settings,
    smartContracts: {
      ...DEFAULT_EVM_SETTINGS.smartContracts,
      ...(settings?.smartContracts ?? {}),
    },
    providerCompatibility: {
      preferOnLegacyDapps: readPreferOnLegacyDapps(settings),
    },
  };
};

const readStoredSettings = async (): Promise<Partial<EvmSettings>> => {
  const settings = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_SETTINGS,
  );
  return isStoredEvmSettings(settings) ? settings : {};
};

const getSettings = async (): Promise<EvmSettings> => {
  return normalizeEvmSettings(await readStoredSettings());
};

const preferOnLegacyDappsForSave = (
  storedPrefer: boolean | null | undefined,
  nextPrefer: boolean | null,
): boolean | null | undefined => {
  if (nextPrefer !== null) {
    return nextPrefer;
  }

  if (storedPrefer === true || storedPrefer === false || storedPrefer === null) {
    return storedPrefer;
  }

  return undefined;
};

const saveSettings = async (newSettings: EvmSettings) => {
  const existing = await readStoredSettings();
  const preferOnLegacyDapps = preferOnLegacyDappsForSave(
    existing.providerCompatibility?.preferOnLegacyDapps,
    newSettings.providerCompatibility.preferOnLegacyDapps,
  );
  const providerCompatibility = {
    ...(existing.providerCompatibility ?? {}),
  };

  if (preferOnLegacyDapps === undefined) {
    delete providerCompatibility.preferOnLegacyDapps;
  } else {
    providerCompatibility.preferOnLegacyDapps = preferOnLegacyDapps;
  }

  const savedSettings: Partial<EvmSettings> = {
    ...existing,
    smartContracts: {
      ...DEFAULT_EVM_SETTINGS.smartContracts,
      ...(existing.smartContracts ?? {}),
      ...newSettings.smartContracts,
    },
  };

  if (Object.keys(providerCompatibility).length > 0) {
    savedSettings.providerCompatibility =
      providerCompatibility as EvmProviderCompatibilitySettings;
  } else {
    delete savedSettings.providerCompatibility;
  }

  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_SETTINGS,
    savedSettings,
  );
};

const setPreferOnLegacyDapps = async (value: boolean | null) => {
  const existing = await readStoredSettings();
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_SETTINGS,
    {
      ...existing,
      providerCompatibility: {
        ...(existing.providerCompatibility ?? {}),
        preferOnLegacyDapps: value,
      },
    },
  );
};

const enablePreferOnLegacyDappsWhenMissing = async () => {
  const existing = await readStoredSettings();
  if (existing.providerCompatibility?.preferOnLegacyDapps !== undefined) {
    return;
  }

  await setPreferOnLegacyDapps(true);
};

export const EvmSettingsUtils = {
  getSettings,
  saveSettings,
  setPreferOnLegacyDapps,
  enablePreferOnLegacyDappsWhenMissing,
};
