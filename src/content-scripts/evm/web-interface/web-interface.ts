import { EvmProviderModule } from '@background/evm/provider/evm-provider';
import Logger from 'src/utils/logger.utils';

const setupInjection = () => {
  console.log('trying to inject keychain');
  try {
    var scriptTag = document.createElement('script');
    scriptTag.src = chrome.runtime.getURL('./evmWebInterfaceBundle.js');
    var container = document.head || document.documentElement;
    container.insertBefore(scriptTag, container.children[0]);
  } catch (e) {
    Logger.error('Hive Keychain injection failed.', e);
  }
};

function onPageLoad() {
  let provider = EvmProviderModule.getProvider();
  console.log({ provider, ethereum: window.ethereum });
  window.ethereum = provider;
  function announceProvider() {
    window.dispatchEvent(
      new CustomEvent('eip6963:announceProvider', {
        detail: Object.freeze({
          info: EvmProviderModule.ProviderInfo,
          provider,
        }),
      }),
    );
  }

  window.addEventListener('eip6963:requestProvider', (event) => {
    console.log('ici');
    announceProvider();
  });

  announceProvider();
}

window.addEventListener('load', () => {
  onPageLoad();
});

setupInjection();
