import { BackgroundMessage } from '@background/multichain/background-message.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { VaultKey } from '@reference-data/vault-message-key.enum';
import { PortfolioSwapCatalogCacheUtils } from 'src/portfolio/portfolio-swap-catalog-cache.utils';
import Logger from 'src/utils/logger.utils';
import VaultUtils from 'src/utils/vault.utils';

let initialized = false;

const warmCache = async () => {
  try {
    await PortfolioSwapCatalogCacheUtils.ensureSwapCatalogCached();
  } catch (error) {
    Logger.error('Unable to warm portfolio swap catalog cache', error);
  }
};

const warmCacheWhenUnlocked = async () => {
  if (await VaultUtils.getValueFromVault(VaultKey.__MK)) {
    await warmCache();
  }
};

const onRuntimeMessage = (
  message: BackgroundMessage,
  sender: chrome.runtime.MessageSender,
) => {
  if (sender.id !== chrome.runtime.id) {
    return;
  }

  if (
    message.command === BackgroundCommand.EVM_WALLET_LOCK_STATE_CHANGED ||
    message.command === BackgroundCommand.VAULT_LOADED
  ) {
    void warmCacheWhenUnlocked();
  }
};

const start = () => {
  if (initialized) {
    return;
  }
  initialized = true;

  VaultUtils.addWalletLockStateListener(() => {
    void warmCacheWhenUnlocked();
  });
  chrome.runtime.onMessage.addListener(onRuntimeMessage);
  void warmCache();
};

export const PortfolioSwapCatalogCacheModule = {
  start,
};
