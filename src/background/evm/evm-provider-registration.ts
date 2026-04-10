import { EvmSettingsUtils } from '@popup/evm/utils/evm-settings.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import {
  EVM_LEGACY_PREFERRED_BUNDLE,
  EVM_LEGACY_YIELDING_BUNDLE,
  EVM_MAIN_PROVIDER_CONTENT_SCRIPT_ID,
  EVM_MAIN_PROVIDER_MATCHES,
} from 'src/background/evm/evm-provider-registration.constants';
import Logger from 'src/utils/logger.utils';

type ScriptingApi = {
  getRegisteredContentScripts: (
    filter?: chrome.scripting.ContentScriptFilter,
  ) => Promise<chrome.scripting.RegisteredContentScript[]>;
  registerContentScripts: (
    scripts: chrome.scripting.RegisteredContentScript[],
  ) => Promise<void>;
  unregisterContentScripts: (
    filter?: chrome.scripting.ContentScriptFilter,
  ) => Promise<void>;
};

let isProviderRegistrationInitialized = false;
let providerRegistrationSyncPromise: Promise<void> | null = null;

const getScriptingApi = (): ScriptingApi | undefined => {
  const globalScope = globalThis as typeof globalThis & {
    browser?: { scripting?: ScriptingApi };
  };

  return (
    globalScope.browser?.scripting ??
    ((chrome as typeof chrome & { scripting?: ScriptingApi }).scripting ??
      undefined)
  );
};

const getDesiredContentScript = (
  preferOnLegacyDapps: boolean,
): chrome.scripting.RegisteredContentScript => ({
  id: EVM_MAIN_PROVIDER_CONTENT_SCRIPT_ID,
  js: [
    preferOnLegacyDapps
      ? EVM_LEGACY_PREFERRED_BUNDLE
      : EVM_LEGACY_YIELDING_BUNDLE,
  ],
  matches: EVM_MAIN_PROVIDER_MATCHES,
  allFrames: true,
  runAt: 'document_start',
  world: 'MAIN',
  persistAcrossSessions: true,
});

const areEquivalentScripts = (
  currentScript: chrome.scripting.RegisteredContentScript | undefined,
  desiredScript: chrome.scripting.RegisteredContentScript,
) => {
  return (
    !!currentScript &&
    JSON.stringify(currentScript.js ?? []) ===
      JSON.stringify(desiredScript.js ?? []) &&
    JSON.stringify(currentScript.matches ?? []) ===
      JSON.stringify(desiredScript.matches ?? []) &&
    currentScript.world === desiredScript.world &&
    currentScript.runAt === desiredScript.runAt &&
    currentScript.allFrames === desiredScript.allFrames
  );
};

export const syncEvmProviderContentScriptRegistration = async () => {
  if (providerRegistrationSyncPromise) {
    return providerRegistrationSyncPromise;
  }

  providerRegistrationSyncPromise = (async () => {
    const scripting = getScriptingApi();

    if (!scripting) {
      Logger.warn('Scripting API unavailable. Skipping EVM provider registration.');
      return;
    }

    const settings = await EvmSettingsUtils.getSettings();
    const desiredScript = getDesiredContentScript(
      settings.providerCompatibility.preferOnLegacyDapps,
    );
    const existingScripts = await scripting.getRegisteredContentScripts({
      ids: [EVM_MAIN_PROVIDER_CONTENT_SCRIPT_ID],
    });
    const currentScript = existingScripts.find(
      (script) => script.id === EVM_MAIN_PROVIDER_CONTENT_SCRIPT_ID,
    );

    if (areEquivalentScripts(currentScript, desiredScript)) {
      return;
    }

    if (currentScript) {
      await scripting.unregisterContentScripts({
        ids: [EVM_MAIN_PROVIDER_CONTENT_SCRIPT_ID],
      });
    }

    try {
      await scripting.registerContentScripts([desiredScript]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `${error}`;
      if (!errorMessage.includes(`Duplicate script ID '${EVM_MAIN_PROVIDER_CONTENT_SCRIPT_ID}'`)) {
        throw error;
      }

      const latestScripts = await scripting.getRegisteredContentScripts({
        ids: [EVM_MAIN_PROVIDER_CONTENT_SCRIPT_ID],
      });
      const latestScript = latestScripts.find(
        (script) => script.id === EVM_MAIN_PROVIDER_CONTENT_SCRIPT_ID,
      );

      if (areEquivalentScripts(latestScript, desiredScript)) {
        return;
      }

      await scripting.unregisterContentScripts({
        ids: [EVM_MAIN_PROVIDER_CONTENT_SCRIPT_ID],
      });
      await scripting.registerContentScripts([desiredScript]);
    }
  })().finally(() => {
    providerRegistrationSyncPromise = null;
  });

  return providerRegistrationSyncPromise;
};

const syncRegisteredProviderScriptWithLogging = async () => {
  try {
    await syncEvmProviderContentScriptRegistration();
  } catch (error) {
    Logger.error('Unable to sync EVM provider content script.', error);
  }
};

export const initializeEvmProviderRegistration = () => {
  if (isProviderRegistrationInitialized) {
    return;
  }

  isProviderRegistrationInitialized = true;

  chrome.runtime.onInstalled.addListener(() => {
    void syncRegisteredProviderScriptWithLogging();
  });

  chrome.runtime.onStartup.addListener(() => {
    void syncRegisteredProviderScriptWithLogging();
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (
      areaName === 'local' &&
      changes[LocalStorageKeyEnum.EVM_SETTINGS] !== undefined
    ) {
      void syncRegisteredProviderScriptWithLogging();
    }
  });

  void syncRegisteredProviderScriptWithLogging();
};

export const __TEST_ONLY__ = {
  areEquivalentScripts,
  getDesiredContentScript,
  getScriptingApi,
  resetInitialization: () => {
    isProviderRegistrationInitialized = false;
    providerRegistrationSyncPromise = null;
  },
};
