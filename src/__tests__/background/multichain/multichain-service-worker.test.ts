import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { VaultCommand, VaultKey } from '@reference-data/vault-message-key.enum';

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

const internalSender = () =>
  ({
    id: chrome.runtime.id,
    url: chrome.runtime.getURL('popup.html'),
  }) as chrome.runtime.MessageSender;

const flushVaultReply = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

const loadMkModule = async () =>
  (await import('@background/hive/modules/mk.module')).default;

describe('multichain service worker message routing', () => {
  const originalFirefox = process.env.IS_FIREFOX;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    delete process.env.IS_FIREFOX;
    Object.defineProperty(chrome.runtime, 'id', {
      configurable: true,
      value: 'keychain-test-extension',
    });
    (chrome.runtime.getURL as jest.Mock).mockImplementation(
      (path: string) => `chrome-extension://keychain-test-extension/${path}`,
    );
  });

  afterEach(() => {
    if (originalFirefox === undefined) {
      delete process.env.IS_FIREFOX;
    } else {
      process.env.IS_FIREFOX = originalFirefox;
    }
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
        jest.fn(),
      ),
    ).toBe(false);
  });

  it('sends the Firefox master password back to the popup', async () => {
    process.env.IS_FIREFOX = 'true';
    const mkModule = await loadMkModule();
    (mkModule.getMk as jest.Mock).mockReturnValue('secret-mk');
    const addListenerSpy = jest.spyOn(chrome.runtime.onMessage, 'addListener');
    await import('@background/multichain/multichain-service-worker');
    const listener = addListenerSpy.mock.calls[0][0] as (
      message: unknown,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: unknown) => void,
    ) => boolean;
    const sendResponse = jest.fn();

    expect(
      listener(
        { command: VaultCommand.GET_VALUE, key: VaultKey.__MK },
        internalSender(),
        sendResponse,
      ),
    ).toBe(true);
    await flushVaultReply();

    expect(mkModule.getMk).toHaveBeenCalledTimes(1);
    expect(sendResponse).toHaveBeenCalledWith('secret-mk');
  });

  it('ignores Firefox vault reads from outside the extension', async () => {
    process.env.IS_FIREFOX = 'true';
    const mkModule = await loadMkModule();
    const addListenerSpy = jest.spyOn(chrome.runtime.onMessage, 'addListener');
    await import('@background/multichain/multichain-service-worker');
    const listener = addListenerSpy.mock.calls[0][0] as (
      message: unknown,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: unknown) => void,
    ) => boolean;
    const sendResponse = jest.fn();

    expect(
      listener(
        { command: VaultCommand.GET_VALUE, key: VaultKey.__MK },
        {
          id: 'other-extension',
          url: 'https://malicious.example/',
        } as chrome.runtime.MessageSender,
        sendResponse,
      ),
    ).toBe(false);
    await flushVaultReply();

    expect(mkModule.getMk).not.toHaveBeenCalled();
    expect(sendResponse).not.toHaveBeenCalled();
  });

  it('settles Firefox vault writes and removals', async () => {
    process.env.IS_FIREFOX = 'true';
    const mkModule = await loadMkModule();
    (mkModule.saveMk as jest.Mock).mockResolvedValue(undefined);
    const addListenerSpy = jest.spyOn(chrome.runtime.onMessage, 'addListener');
    await import('@background/multichain/multichain-service-worker');
    const listener = addListenerSpy.mock.calls[0][0] as (
      message: unknown,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: unknown) => void,
    ) => boolean;
    const saveResponse = jest.fn();
    const removeResponse = jest.fn();

    expect(
      listener(
        {
          command: VaultCommand.SET_VALUE,
          key: VaultKey.__MK,
          value: 'secret-mk',
        },
        internalSender(),
        saveResponse,
      ),
    ).toBe(true);
    expect(
      listener(
        { command: VaultCommand.REMOVE_VALUE, key: VaultKey.__MK },
        internalSender(),
        removeResponse,
      ),
    ).toBe(true);
    await flushVaultReply();

    expect(mkModule.saveMk).toHaveBeenCalledWith('secret-mk');
    expect(saveResponse).toHaveBeenCalledWith(true);
    expect(mkModule.lock).toHaveBeenCalledTimes(1);
    expect(removeResponse).toHaveBeenCalledWith(true);
  });
});
