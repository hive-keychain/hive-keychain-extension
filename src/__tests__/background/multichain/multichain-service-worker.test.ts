import { BackgroundCommand } from '@reference-data/background-message-key.enum';

jest.mock('@background/evm/evm-service-worker', () => ({
  EvmServiceWorker: { initializeServiceWorker: jest.fn() },
}));
jest.mock('@background/hive/hive-service-worker', () => ({
  HiveServiceWorker: { initializeServiceWorker: jest.fn() },
}));
jest.mock('@background/hive/modules/mk.module', () => ({
  __esModule: true,
  default: {
    getMk: jest.fn(),
    saveMk: jest.fn(),
    lock: jest.fn(),
  },
}));
jest.mock('@background/multichain/extension-ui.lifecycle', () => ({
  ExtensionUiLifecycle: { registerExtensionUiLifecycle: jest.fn() },
}));
jest.mock('@background/multichain/pending-request-lifecycle', () => ({
  PendingRequestLifecycle: { register: jest.fn() },
}));
jest.mock('@background/multichain/side-panel-toolbar.lifecycle', () => ({
  SidePanelToolbarLifecycle: {
    registerSidePanelToolbarLifecycle: jest.fn(),
    handleToolbarClickWhileSidePanelSessionActive: jest.fn(),
  },
}));
jest.mock('@background/portfolio-swap-catalog-cache.module', () => ({
  PortfolioSwapCatalogCacheModule: { start: jest.fn() },
}));
jest.mock('@background/vault.module', () => ({
  __esModule: true,
  default: { init: jest.fn() },
}));
jest.mock('@popup/multichain/utils/chain.utils', () => ({
  ChainUtils: { initChains: jest.fn().mockResolvedValue(undefined) },
}));
jest.mock('src/utils/ecosystem-dapps-cache.utils', () => ({
  ensureEcosystemDappsCached: jest.fn(),
}));
jest.mock('src/utils/i18n.utils', () => ({
  I18nUtils: {
    initLanguageFromStorage: jest.fn(),
    changeLanguage: jest.fn(),
  },
}));
jest.mock('src/utils/logger.utils', () => ({
  __esModule: true,
  default: { log: jest.fn() },
}));
jest.mock('src/utils/side-panel-preference.utils', () => ({
  SidePanelPreferenceUtils: {
    syncSidePanelStartupSettings: jest.fn(),
    markSidePanelInactive: jest.fn(),
  },
}));

describe('multichain service worker message routing', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('does not answer EVM transaction submission messages', async () => {
    const addListenerSpy = jest.spyOn(
      chrome.runtime.onMessage,
      'addListener',
    );
    Object.defineProperty(chrome, 'action', {
      configurable: true,
      value: { onClicked: { addListener: jest.fn() } },
    });
    await import('@background/multichain/multichain-service-worker');
    const listener = addListenerSpy.mock.calls[0][0];

    expect(
      listener(
        { command: BackgroundCommand.EVM_TRANSACTION_SUBMISSION },
        {} as chrome.runtime.MessageSender,
      ),
    ).toBe(false);
  });
});
