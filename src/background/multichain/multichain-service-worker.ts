import {
  BackgroundMessage,
  BaseBackgroundMessage,
} from '@background/multichain/background-message.interface';
import { EvmServiceWorker } from '@background/evm/evm-service-worker';
import { HiveServiceWorker } from '@background/hive/hive-service-worker';
import MkModule from '@background/hive/modules/mk.module';
import VaultModule from '@background/vault.module';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { VaultCommand, VaultKey } from '@reference-data/vault-message-key.enum';
import { ensureEcosystemDappsCached } from 'src/utils/ecosystem-dapps-cache.utils';
import Logger from 'src/utils/logger.utils';
import { BackgroundCommand } from 'src/reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from 'src/reference-data/local-storage-key.enum';
import { SidePanelToolbarLifecycle } from '@background/multichain/side-panel-toolbar.lifecycle';
import { SidePanelPreferenceUtils } from 'src/utils/side-panel-preference.utils';
import { I18nUtils } from 'src/utils/i18n.utils';

Object.assign(global, { contextType: 'service_worker' });

void I18nUtils.initLanguageFromStorage();
HiveServiceWorker.initializeServiceWorker();
EvmServiceWorker.initializeServiceWorker();

const syncSidePanelStartupSettings = () => {
  void SidePanelPreferenceUtils.syncSidePanelStartupSettings();
};

syncSidePanelStartupSettings();
chrome.runtime.onInstalled.addListener(syncSidePanelStartupSettings);
chrome.runtime.onStartup.addListener(syncSidePanelStartupSettings);

if (!process.env.IS_FIREFOX) {
  SidePanelToolbarLifecycle.registerSidePanelToolbarLifecycle();
  chrome.action.onClicked.addListener(() => {
    void SidePanelToolbarLifecycle.handleToolbarClickWhileSidePanelSessionActive();
  });
}
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local') {
    return;
  }

  if (changes[LocalStorageKeyEnum.OPEN_SIDE_PANEL_BY_DEFAULT]) {
    syncSidePanelStartupSettings();
  }

  const languageChange = changes[LocalStorageKeyEnum.ACTIVE_LANGUAGE];
  if (typeof languageChange?.newValue === 'string') {
    void I18nUtils.changeLanguage(languageChange.newValue);
  }
});

(async () => {
  if (!process.env.IS_FIREFOX) {
    Logger.log('Initializing vault');
    VaultModule.init();
  }
  await ChainUtils.initChains();
  void ensureEcosystemDappsCached();
})();

const isInternalExtensionSender = (sender: chrome.runtime.MessageSender) => {
  return (
    sender.id === chrome.runtime.id &&
    !!sender.url &&
    sender.url.startsWith(chrome.runtime.getURL(''))
  );
};

const chromeMessageHandler = async (
  backgroundMessage: BackgroundMessage,
  sender: chrome.runtime.MessageSender,
) => {
  if (
    process.env.IS_FIREFOX &&
    Object.values(VaultCommand).includes(backgroundMessage.command as VaultCommand)
  ) {
    const vaultMessage = backgroundMessage as BaseBackgroundMessage;
    if (
      vaultMessage.key !== VaultKey.__MK ||
      !isInternalExtensionSender(sender)
    )
      return;
  }

  switch (backgroundMessage.command) {
    case BackgroundCommand.SIDE_PANEL_CLOSED:
      if (!process.env.IS_FIREFOX) {
        void SidePanelPreferenceUtils.markSidePanelInactive();
      }
      return true;
    // Replace vault by persistent data storage for Firefox
    case VaultCommand.GET_VALUE:
      if (!process.env.IS_FIREFOX) return;
      return MkModule.getMk();
    case VaultCommand.SET_VALUE:
      if (!process.env.IS_FIREFOX) return;
      MkModule.saveMk(backgroundMessage.value);
      return true;
    case VaultCommand.REMOVE_VALUE:
      if (!process.env.IS_FIREFOX) return;
      MkModule.lock();
      return true;
  }
  return true;
};

chrome.runtime.onMessage.addListener(chromeMessageHandler);
