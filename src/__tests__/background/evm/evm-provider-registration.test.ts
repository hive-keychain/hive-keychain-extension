import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import {
  __TEST_ONLY__,
  initializeEvmProviderRegistration,
  syncEvmProviderContentScriptRegistration,
} from 'src/background/evm/evm-provider-registration';

const getSettingsMock = jest.fn() as any;
const createAsyncMock = (value: any) => jest.fn(async () => value) as any;

jest.mock('@popup/evm/utils/evm-settings.utils', () => ({
  EvmSettingsUtils: {
    getSettings: (...args: any[]) => getSettingsMock(...args),
  },
}));

const flushPromises = async () => Promise.resolve();

describe('evm-provider-registration tests:\n', () => {
  beforeEach(() => {
    __TEST_ONLY__.resetInitialization();
    getSettingsMock.mockReset();
    chrome.runtime.onInstalled = {
      addListener: jest.fn(),
    } as any;
    chrome.runtime.onStartup = {
      addListener: jest.fn(),
    } as any;
    chrome.storage.onChanged = {
      addListener: jest.fn(),
    } as any;
    chrome.scripting = {
      getRegisteredContentScripts: createAsyncMock([]),
      registerContentScripts: createAsyncMock(undefined),
      unregisterContentScripts: createAsyncMock(undefined),
    } as any;
    jest.clearAllMocks();
  });

  it('registers the preferred legacy bundle by default', async () => {
    getSettingsMock.mockResolvedValue({
      smartContracts: {
        displayPossibleSpam: false,
        displayNonVerifiedContracts: false,
      },
      providerCompatibility: {
        preferOnLegacyDapps: true,
      },
    });

    await syncEvmProviderContentScriptRegistration();

    expect(chrome.scripting.registerContentScripts).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'evm-main-provider',
        js: ['evmKeychainLegacyPreferredBundle.js'],
        world: 'MAIN',
        runAt: 'document_start',
        allFrames: true,
      }),
    ]);
  });

  it('registers the yielding legacy bundle when preference is disabled', async () => {
    getSettingsMock.mockResolvedValue({
      smartContracts: {
        displayPossibleSpam: false,
        displayNonVerifiedContracts: false,
      },
      providerCompatibility: {
        preferOnLegacyDapps: false,
      },
    });

    await syncEvmProviderContentScriptRegistration();

    expect(chrome.scripting.registerContentScripts).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'evm-main-provider',
        js: ['evmKeychainLegacyYieldingBundle.js'],
      }),
    ]);
  });

  it('does not reregister when the correct script is already active', async () => {
    getSettingsMock.mockResolvedValue({
      smartContracts: {
        displayPossibleSpam: false,
        displayNonVerifiedContracts: false,
      },
      providerCompatibility: {
        preferOnLegacyDapps: false,
      },
    });
    chrome.scripting.getRegisteredContentScripts = createAsyncMock([
        {
          id: 'evm-main-provider',
          js: ['evmKeychainLegacyYieldingBundle.js'],
          matches: ['https://*/*', 'http://0.0.0.0:1337/*', 'http://*/*'],
          world: 'MAIN',
          runAt: 'document_start',
          allFrames: true,
        },
      ]);

    await syncEvmProviderContentScriptRegistration();

    expect(chrome.scripting.unregisterContentScripts).not.toHaveBeenCalled();
    expect(chrome.scripting.registerContentScripts).not.toHaveBeenCalled();
  });

  it('updates future page loads when the EVM setting changes', async () => {
    getSettingsMock.mockResolvedValue({
      smartContracts: {
        displayPossibleSpam: false,
        displayNonVerifiedContracts: false,
      },
      providerCompatibility: {
        preferOnLegacyDapps: false,
      },
    });

    initializeEvmProviderRegistration();

    const storageListener = (
      chrome.storage.onChanged.addListener as unknown as jest.Mock
    ).mock.calls[0][0] as (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string,
    ) => void;

    storageListener(
      {
        [LocalStorageKeyEnum.EVM_SETTINGS]: {
          newValue: { providerCompatibility: { preferOnLegacyDapps: false } },
        },
      },
      'local',
    );

    await flushPromises();
    await flushPromises();

    expect(chrome.scripting.registerContentScripts).toHaveBeenCalledWith([
      expect.objectContaining({
        js: ['evmKeychainLegacyYieldingBundle.js'],
      }),
    ]);
  });

  it('treats duplicate script registration as a benign concurrent sync when the desired script is already active', async () => {
    getSettingsMock.mockResolvedValue({
      smartContracts: {
        displayPossibleSpam: false,
        displayNonVerifiedContracts: false,
      },
      providerCompatibility: {
        preferOnLegacyDapps: true,
      },
    });

    chrome.scripting.getRegisteredContentScripts = jest
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 'evm-main-provider',
          js: ['evmKeychainLegacyPreferredBundle.js'],
          matches: ['https://*/*', 'http://0.0.0.0:1337/*', 'http://*/*'],
          world: 'MAIN',
          runAt: 'document_start',
          allFrames: true,
        },
      ]) as any;
    chrome.scripting.registerContentScripts = jest
      .fn()
      .mockRejectedValueOnce(new Error("Duplicate script ID 'evm-main-provider'")) as any;

    await expect(
      syncEvmProviderContentScriptRegistration(),
    ).resolves.toBeUndefined();

    expect(chrome.scripting.unregisterContentScripts).not.toHaveBeenCalled();
  });
});
