import {
  EvmProvider,
  EvmProviderModule,
} from 'src/content-scripts/evm/injected/provider/evm-provider';

const onPageLoad = () => {
  let provider = EvmProviderModule.getProvider();
  window.ethereum = provider;
  window.addEventListener('eip6963:requestProvider', (event) => {
    announceProvider(provider);
  });

  announceProvider(provider);
};

const announceProvider = (provider: EvmProvider) => {
  window.dispatchEvent(
    new CustomEvent('eip6963:announceProvider', {
      detail: Object.freeze({
        info: EvmProviderModule.ProviderInfo,
        provider,
      }),
    }),
  );
};

window.addEventListener('load', () => {
  onPageLoad();
});
