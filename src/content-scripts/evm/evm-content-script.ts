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
import {
  PROVIDER_COMPATIBILITY_DATA_ATTRIBUTE,
  PROVIDER_COMPATIBILITY_UPDATE_EVENT,
} from 'src/content-scripts/evm/provider-compatibility.constants';
import Logger from 'src/utils/logger.utils';

const setSharedProviderCompatibilityPreference = (
  preferOnLegacyDapps: boolean,
) => {
  document.documentElement?.dataset &&
    (document.documentElement.dataset[
      PROVIDER_COMPATIBILITY_DATA_ATTRIBUTE
    ] = String(preferOnLegacyDapps));
};

const dispatchProviderCompatibilityUpdate = () => {
  document.dispatchEvent(new Event(PROVIDER_COMPATIBILITY_UPDATE_EVENT));
};

const setupInjection = () => {
  const defaultPreferOnLegacyDapps =
    DEFAULT_EVM_SETTINGS.providerCompatibility.preferOnLegacyDapps;
  setSharedProviderCompatibilityPreference(defaultPreferOnLegacyDapps);

  EvmSettingsUtils.getSettings()
    .then((settings) => {
      const preferOnLegacyDapps =
        settings.providerCompatibility.preferOnLegacyDapps;

      if (preferOnLegacyDapps === defaultPreferOnLegacyDapps) {
        return;
      }

      setSharedProviderCompatibilityPreference(preferOnLegacyDapps);
      dispatchProviderCompatibilityUpdate();
    })
    .catch((e) => {
      Logger.warn(
        'Unable to read EVM settings before injection. Falling back to defaults.',
      );
      Logger.error(e);
    });
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
