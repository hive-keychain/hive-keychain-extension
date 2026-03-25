import { BackgroundMessage } from '@background/multichain/background-message.interface';
import {
  DEFAULT_EVM_SETTINGS,
  EvmSettingsUtils,
} from '@popup/evm/utils/evm-settings.utils';
import { EvmEventName } from '@interfaces/evm-provider.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import {
  sendErrorToEvm,
  sendEventToEvm,
  sendEvmChainToBackground,
  sendEvmRequestToBackground,
  sendResponseToEvm,
} from 'src/content-scripts/hive/web-interface/response.logic';
import Logger from 'src/utils/logger.utils';

const injectPageProvider = (preferOnLegacyDapps: boolean) => {
  const scriptTag = document.createElement('script');
  scriptTag.src = chrome.runtime.getURL('./evmKeychainBundle.js');
  scriptTag.dataset.preferOnLegacyDapps = String(preferOnLegacyDapps);

  const container = document.head || document.documentElement;

  if (!container) {
    throw new Error('Missing document container for EVM injection.');
  }

  container.insertBefore(scriptTag, container.firstChild);
};

const setupInjection = async () => {
  let preferOnLegacyDapps =
    DEFAULT_EVM_SETTINGS.providerCompatibility.preferOnLegacyDapps;

  try {
    const settings = await EvmSettingsUtils.getSettings();
    preferOnLegacyDapps = settings.providerCompatibility.preferOnLegacyDapps;
  } catch (e) {
    Logger.warn(
      'Unable to read EVM settings before injection. Falling back to defaults.',
    );
    Logger.error(e);
  }

  try {
    injectPageProvider(preferOnLegacyDapps);
  } catch (e) {
    Logger.error('Hive Keychain injection failed.', e);
  }
};

document.addEventListener(EvmEventName.REQUEST, async (request: any) => {
  sendEvmRequestToBackground(request.detail, chrome);
});

document.addEventListener(
  EvmEventName.SEND_BACK_CHAIN_TO_BACKGROUND,
  (event: any) => {
    sendEvmChainToBackground(event.detail, chrome);
  },
);

chrome.runtime.onMessage.addListener(
  (
    backgroundMessage: BackgroundMessage,
    sender: chrome.runtime.MessageSender,
    sendResp: (response?: any) => void,
  ) => {
    if (backgroundMessage.command === BackgroundCommand.SEND_EVM_RESPONSE) {
      sendResponseToEvm(backgroundMessage.value);
    } else if (backgroundMessage.command === BackgroundCommand.SEND_EVM_ERROR) {
      sendErrorToEvm(backgroundMessage.value);
    } else if (
      backgroundMessage.command ===
      BackgroundCommand.SEND_EVM_EVENT_TO_CONTENT_SCRIPT
    ) {
      sendEventToEvm(backgroundMessage.value!);
    }
  },
);

setupInjection();
