import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import Logger from 'src/utils/logger.utils';

const init = async () => {
  if (!chrome.offscreen) {
    return;
  }

  let offscreenDocumentLoadedListener: (msg: any) => void;
  const loadPromise = new Promise((resolve) => {
    offscreenDocumentLoadedListener = (msg) => {
      if (msg.command === BackgroundCommand.VAULT_LOADED) {
        Logger.log('Vault loaded');
        chrome.runtime.onMessage.removeListener(
          offscreenDocumentLoadedListener,
        );
        resolve(true);
      }
    };
    chrome.runtime.onMessage.addListener(offscreenDocumentLoadedListener);
  });

  try {
    const offscreenExists = await chrome.offscreen.hasDocument();
    if (offscreenExists) {
      Logger.debug('Found existing offscreen document, closing.');
      return;
    }

    await chrome.offscreen.createDocument({
      url: './vault.html',
      reasons: [chrome.offscreen.Reason.IFRAME_SCRIPTING],
      justification:
        'Used for Hardware Wallet and sensitive data storage to communicate with the extension.',
    });
  } catch (error) {
    Logger.error('Failed to create offscreen document', error);
    return;
  }

  const timeoutPromise = new Promise((resolve) => {
    setTimeout(() => {
      resolve(false);
    }, 3000);
  });

  await Promise.race([loadPromise, timeoutPromise]);
};

const VaultModule = {
  init,
};

export default VaultModule;
