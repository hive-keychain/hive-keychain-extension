import { EvmSettings } from '@popup/evm/interfaces/evm-settings.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const getSettings = async (): Promise<EvmSettings> => {
  const settings = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_SETTINGS,
  );
  return (
    settings ?? {
      smartContracts: {
        displayPossibleSpam: false,
        displayNonVerifiedContracts: false,
      },
    }
  );
};

const saveSettings = async (newSettings: EvmSettings) => {
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_SETTINGS,
    newSettings,
  );
};

export const EvmSettingsUtils = {
  getSettings,
  saveSettings,
};
