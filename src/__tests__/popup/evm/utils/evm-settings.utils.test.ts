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

  const smartContracts = {
    displayPossibleSpam: false,
    displayNonVerifiedContracts: true,
  };

  it('keeps legacy dapp preference off when storage is empty', async () => {
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue(undefined);

    const settings = await EvmSettingsUtils.getSettings();

    expect(settings).toEqual(DEFAULT_EVM_SETTINGS);
    expect(settings.providerCompatibility.preferOnLegacyDapps).toBeNull();
  });

  it('keeps a missing legacy dapp preference off for older saved settings', async () => {
    jest.spyOn(LocalStorageUtils, 'getValueFromLocalStorage').mockResolvedValue({
      smartContracts: {
        displayPossibleSpam: true,
        displayNonVerifiedContracts: false,
      },
    });

    const settings = await EvmSettingsUtils.getSettings();

    expect(settings.smartContracts.displayPossibleSpam).toBe(true);
    expect(settings.providerCompatibility.preferOnLegacyDapps).toBeNull();
  });

  it('preserves an explicit legacy dapp preference', async () => {
    jest.spyOn(LocalStorageUtils, 'getValueFromLocalStorage').mockResolvedValue({
      providerCompatibility: {
        preferOnLegacyDapps: false,
      },
    });

    const settings = await EvmSettingsUtils.getSettings();

    expect(settings.providerCompatibility.preferOnLegacyDapps).toBe(false);
  });

  it('writes an explicit legacy dapp preference', async () => {
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue(undefined);
    const saveSpy = jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockResolvedValue();

    await EvmSettingsUtils.saveSettings({
      smartContracts,
      providerCompatibility: {
        preferOnLegacyDapps: false,
      },
    });

    expect(saveSpy).toHaveBeenCalledWith(LocalStorageKeyEnum.EVM_SETTINGS, {
      smartContracts,
      providerCompatibility: {
        preferOnLegacyDapps: false,
      },
    });
  });

  it('keeps a missing legacy dapp preference missing when other settings are saved', async () => {
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue({
        smartContracts: {
          displayPossibleSpam: true,
          displayNonVerifiedContracts: false,
        },
      });
    const saveSpy = jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockResolvedValue();

    await EvmSettingsUtils.saveSettings({
      smartContracts,
      providerCompatibility: {
        preferOnLegacyDapps: null,
      },
    });

    expect(saveSpy).toHaveBeenCalledWith(LocalStorageKeyEnum.EVM_SETTINGS, {
      smartContracts,
    });
  });

  it('keeps a cleared legacy dapp preference when other settings are saved', async () => {
    jest.spyOn(LocalStorageUtils, 'getValueFromLocalStorage').mockResolvedValue({
      providerCompatibility: {
        preferOnLegacyDapps: null,
      },
    });
    const saveSpy = jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockResolvedValue();

    await EvmSettingsUtils.saveSettings({
      smartContracts,
      providerCompatibility: {
        preferOnLegacyDapps: null,
      },
    });

    expect(saveSpy).toHaveBeenCalledWith(LocalStorageKeyEnum.EVM_SETTINGS, {
      providerCompatibility: {
        preferOnLegacyDapps: null,
      },
      smartContracts,
    });
  });

  it('enables a missing legacy dapp preference without changing an explicit value', async () => {
    const storage: Record<string, unknown> = {};
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation(async (key) => storage[key as string]);
    jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockImplementation(async (key, value) => {
        storage[key as string] = value;
      });

    await EvmSettingsUtils.enablePreferOnLegacyDappsWhenMissing();

    expect(storage[LocalStorageKeyEnum.EVM_SETTINGS]).toEqual({
      providerCompatibility: {
        preferOnLegacyDapps: true,
      },
    });

    storage[LocalStorageKeyEnum.EVM_SETTINGS] = {
      smartContracts,
      providerCompatibility: {
        preferOnLegacyDapps: false,
      },
    };

    await EvmSettingsUtils.enablePreferOnLegacyDappsWhenMissing();

    expect(storage[LocalStorageKeyEnum.EVM_SETTINGS]).toEqual({
      smartContracts,
      providerCompatibility: {
        preferOnLegacyDapps: false,
      },
    });
  });
});
