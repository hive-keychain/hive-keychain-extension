import { BackgroundMessage } from '@background/background-message.interface';
import { EvmServiceWorker } from '@background/evm/evm-service-worker';
import { HiveServiceWorker } from '@background/hive/hive-service-worker';
import MkModule from '@background/hive/modules/mk.module';
import VaultModule from '@background/vault.module';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { VaultCommand, VaultKey } from '@reference-data/vault-message-key.enum';
import { ensureEcosystemDappsCached } from 'src/utils/ecosystem-dapps-cache.utils';
import Logger from 'src/utils/logger.utils';
import { SidePanelPreferenceUtils } from 'src/utils/side-panel-preference.utils';
import { LocalStorageKeyEnum } from 'src/reference-data/local-storage-key.enum';

Object.assign(global, { contextType: 'service_worker' });

HiveServiceWorker.initializeServiceWorker();
EvmServiceWorker.initializeServiceWorker();

const syncSidePanelStartupSettings = () => {
  void SidePanelPreferenceUtils.syncSidePanelStartupSettings();
};

syncSidePanelStartupSettings();
chrome.runtime.onInstalled.addListener(syncSidePanelStartupSettings);
chrome.runtime.onStartup.addListener(syncSidePanelStartupSettings);
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local') {
    return;
  }

  if (changes[LocalStorageKeyEnum.OPEN_SIDE_PANEL_BY_DEFAULT]) {
    syncSidePanelStartupSettings();
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
    if (
      backgroundMessage.key !== VaultKey.__MK ||
      !isInternalExtensionSender(sender)
    )
      return;
  }

  switch (backgroundMessage.command) {
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
