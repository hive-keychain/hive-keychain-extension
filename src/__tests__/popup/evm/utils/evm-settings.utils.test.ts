import {
  DEFAULT_EVM_SETTINGS,
  EvmSettingsUtils,
} from '@popup/evm/utils/evm-settings.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

describe('evm-settings.utils tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it('returns provider compatibility enabled by default when storage is empty', async () => {
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue(undefined);

    const settings = await EvmSettingsUtils.getSettings();

    expect(settings).toEqual(DEFAULT_EVM_SETTINGS);
    expect(settings.providerCompatibility.preferOnLegacyDapps).toBe(true);
  });

  it('backfills provider compatibility for legacy saved settings', async () => {
    jest.spyOn(LocalStorageUtils, 'getValueFromLocalStorage').mockResolvedValue({
      smartContracts: {
        displayPossibleSpam: true,
        displayNonVerifiedContracts: false,
      },
    });

    const settings = await EvmSettingsUtils.getSettings();

    expect(settings.smartContracts.displayPossibleSpam).toBe(true);
    expect(settings.providerCompatibility.preferOnLegacyDapps).toBe(true);
  });

  it('normalizes provider compatibility before saving', async () => {
    const saveSpy = jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockResolvedValue();

    await EvmSettingsUtils.saveSettings({
      smartContracts: {
        displayPossibleSpam: false,
        displayNonVerifiedContracts: true,
      },
      providerCompatibility: {
        preferOnLegacyDapps: false,
      },
    });

    expect(saveSpy).toHaveBeenCalledWith(LocalStorageKeyEnum.EVM_SETTINGS, {
      smartContracts: {
        displayPossibleSpam: false,
        displayNonVerifiedContracts: true,
      },
      providerCompatibility: {
        preferOnLegacyDapps: false,
      },
    });
  });
});
