import {
  EvmProvider,
  EvmProviderModule,
} from 'src/content-scripts/evm/injected/provider/evm-provider';
import {
  InjectedWindow,
  LegacyProviderMode,
  ensureProviderCompatibility,
  getProviderCompatibilityController,
} from 'src/content-scripts/evm/injected/provider/provider-compatibility';

const announceProvider = (
  injectedWindow: InjectedWindow,
  provider: EvmProvider,
) => {
  injectedWindow.dispatchEvent(
    new CustomEvent('eip6963:announceProvider', {
      detail: Object.freeze({
        info: EvmProviderModule.ProviderInfo,
        provider,
      }),
    }),
  );
};

export const bootstrapEvmKeychain = (
  injectedWindow: InjectedWindow = window,
) => {
  const existingController = getProviderCompatibilityController(injectedWindow);
  const provider =
    existingController?.provider ?? EvmProviderModule.getProvider();
  const controller = ensureProviderCompatibility(injectedWindow, provider);

  if (controller.claimEip6963Listener()) {
    injectedWindow.addEventListener('eip6963:requestProvider', () => {
      announceProvider(injectedWindow, controller.provider);
    });
  }

  if (controller.claimProviderAnnouncement()) {
    announceProvider(injectedWindow, controller.provider);
  }

  if (controller.claimInitializedEvent()) {
    injectedWindow.dispatchEvent(new Event('ethereum#initialized'));
  }
};

export const configureEvmKeychainLegacyMode = (
  mode: LegacyProviderMode,
  injectedWindow: InjectedWindow = window,
) => {
  if (!getProviderCompatibilityController(injectedWindow)) {
    bootstrapEvmKeychain(injectedWindow);
  }

  getProviderCompatibilityController(injectedWindow)?.configure(mode);
};
