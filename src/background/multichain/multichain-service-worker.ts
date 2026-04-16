import { BackgroundMessage } from '@background/background-message.interface';
import { EvmServiceWorker } from '@background/evm/evm-service-worker';
import { HiveServiceWorker } from '@background/hive/hive-service-worker';
import MkModule from '@background/hive/modules/mk.module';
import VaultModule from '@background/vault.module';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { VaultCommand } from '@reference-data/vault-message-key.enum';
import { ensureEcosystemDappsCached } from 'src/utils/ecosystem-dapps-cache.utils';
import Logger from 'src/utils/logger.utils';

Object.assign(global, { contextType: 'service_worker' });

HiveServiceWorker.initializeServiceWorker();
EvmServiceWorker.initializeServiceWorker();

(async () => {
  if (!process.env.IS_FIREFOX) {
    Logger.log('Initializing vault');
    VaultModule.init();
  }
  await ChainUtils.initChains();
  void ensureEcosystemDappsCached();
})();

const chromeMessageHandler = async (backgroundMessage: BackgroundMessage) => {
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
