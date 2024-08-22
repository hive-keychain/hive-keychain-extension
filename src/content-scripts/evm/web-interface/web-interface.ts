import {
  EvmProvider,
  EvmProviderModule,
} from '@background/evm/provider/evm-provider';

const onPageLoad = () => {
  let provider = EvmProviderModule.getProvider();
  console.log({ provider, ethereum: window.ethereum });
  window.ethereum = provider;

  window.addEventListener('eip6963:requestProvider', (event) => {
    console.log('ici');
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
