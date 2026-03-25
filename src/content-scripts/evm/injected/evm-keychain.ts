import {
  EvmProvider,
  EvmProviderModule,
} from 'src/content-scripts/evm/injected/provider/evm-provider';
import {
  LegacyProviderMode,
  registerLegacyProvider,
} from 'src/content-scripts/evm/injected/provider/provider-compatibility';

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

export const bootstrapEvmKeychain = (mode: LegacyProviderMode) => {
  const provider = EvmProviderModule.getProvider();
  registerLegacyProvider(window, provider, mode);

  window.addEventListener('eip6963:requestProvider', () => {
    announceProvider(provider);
  });

  announceProvider(provider);

  window.dispatchEvent(new Event('ethereum#initialized'));
};
