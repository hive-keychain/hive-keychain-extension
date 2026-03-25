import { EvmSettings } from '@popup/evm/interfaces/evm-settings.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

export const DEFAULT_EVM_SETTINGS: EvmSettings = {
  smartContracts: {
    displayPossibleSpam: false,
    displayNonVerifiedContracts: false,
  },
  providerCompatibility: {
    preferOnLegacyDapps: true,
  },
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
      ...DEFAULT_EVM_SETTINGS.providerCompatibility,
      ...(settings?.providerCompatibility ?? {}),
    },
  };
};

const getSettings = async (): Promise<EvmSettings> => {
  const settings = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_SETTINGS,
  );
  return normalizeEvmSettings(settings);
};

const saveSettings = async (newSettings: EvmSettings) => {
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_SETTINGS,
    normalizeEvmSettings(newSettings),
  );
};

export const EvmSettingsUtils = {
  getSettings,
  saveSettings,
};
