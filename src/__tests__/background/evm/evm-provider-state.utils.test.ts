import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';

jest.mock('@popup/evm/utils/wallet.utils', () => ({
  EvmWalletUtils: {
    getConnectedWallets: jest.fn(),
    setConnectedWallets: jest.fn(),
  },
}));

jest.mock('@popup/evm/utils/evm-chain.utils', () => ({
  EvmChainUtils: {
    getLastEvmChainIdForOrigin: jest.fn(),
    getEthChainId: jest.fn(),
    setChainIdForOrigin: jest.fn(),
  },
}));

jest.mock('src/utils/communication.utils', () => ({
  CommunicationUtils: {
    tabsSendMessage: jest.fn(),
  },
}));

jest.mock('src/utils/localStorage.utils', () => ({
  __esModule: true,
  default: {
    getValueFromLocalStorage: jest.fn(),
    saveValueInLocalStorage: jest.fn(),
  },
}));

const loadTestContext = async () => {
  const providerStateUtils = await import(
    '@background/evm/evm-provider-state.utils'
  );
  const { EvmWalletUtils } = await import('@popup/evm/utils/wallet.utils');
  const { EvmChainUtils } = await import('@popup/evm/utils/evm-chain.utils');
  const { CommunicationUtils } = await import('src/utils/communication.utils');
  const LocalStorageUtils = (await import('src/utils/localStorage.utils'))
    .default;

  return {
    ...providerStateUtils,
    EvmWalletUtils: EvmWalletUtils as {
      getConnectedWallets: jest.Mock;
      setConnectedWallets: jest.Mock;
    },
    EvmChainUtils: EvmChainUtils as {
      getLastEvmChainIdForOrigin: jest.Mock;
      getEthChainId: jest.Mock;
      setChainIdForOrigin: jest.Mock;
    },
    CommunicationUtils: CommunicationUtils as {
      tabsSendMessage: jest.Mock;
    },
    LocalStorageUtils: LocalStorageUtils as {
      getValueFromLocalStorage: jest.Mock;
      saveValueInLocalStorage: jest.Mock;
    },
  };
};

describe('evm provider state utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    chrome.tabs.query.mockImplementation((_queryInfo, callback) => {
      callback([
        { id: 1, url: 'http://localhost:3000/' },
        { id: 2, url: 'http://localhost:5173/' },
        { id: 3, url: 'https://localhost/' },
      ] as chrome.tabs.Tab[]);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('routes origin-scoped account updates only to tabs on the same origin', async () => {
    const { setAccountsForOrigin, EvmWalletUtils, CommunicationUtils } =
      await loadTestContext();
    EvmWalletUtils.getConnectedWallets.mockResolvedValue([]);
    EvmWalletUtils.setConnectedWallets.mockResolvedValue(undefined);

    await expect(
      setAccountsForOrigin('http://localhost:3000', ['0xAbC123']),
    ).resolves.toEqual(['0xabc123']);

    expect(EvmWalletUtils.setConnectedWallets).toHaveBeenCalledWith(
      'http://localhost:3000',
      ['0xabc123'],
    );
    expect(CommunicationUtils.tabsSendMessage).toHaveBeenCalledTimes(1);
    expect(CommunicationUtils.tabsSendMessage).toHaveBeenCalledWith(1, {
      command: BackgroundCommand.SEND_EVM_EVENT_TO_CONTENT_SCRIPT,
      value: {
        eventType: 'accountsChanged',
        args: ['0xabc123'],
        scope: { kind: 'origin', origin: 'http://localhost:3000' },
      },
    });
  });

  it('dedupes identical account updates after normalization', async () => {
    const { emitAccountsChangedIfNeeded, CommunicationUtils } =
      await loadTestContext();

    await expect(
      emitAccountsChangedIfNeeded(
        'http://localhost:3000',
        ['0xAbC123'],
        ['0xabc123'],
      ),
    ).resolves.toEqual(['0xabc123']);

    expect(CommunicationUtils.tabsSendMessage).not.toHaveBeenCalled();
  });

  it('routes chain changes only to the exact matching origin', async () => {
    const { setChainIdForOrigin, EvmChainUtils, CommunicationUtils } =
      await loadTestContext();
    EvmChainUtils.getLastEvmChainIdForOrigin.mockResolvedValue('0x1');
    EvmChainUtils.getEthChainId.mockResolvedValue('0x1');
    EvmChainUtils.setChainIdForOrigin.mockResolvedValue(undefined);

    await expect(
      setChainIdForOrigin('https://localhost', '0xA'),
    ).resolves.toBe('0xa');

    expect(EvmChainUtils.setChainIdForOrigin).toHaveBeenCalledWith(
      'https://localhost',
      '0xa',
    );
    expect(CommunicationUtils.tabsSendMessage).toHaveBeenCalledTimes(1);
    expect(CommunicationUtils.tabsSendMessage).toHaveBeenCalledWith(3, {
      command: BackgroundCommand.SEND_EVM_EVENT_TO_CONTENT_SCRIPT,
      value: {
        eventType: 'chainChanged',
        args: '0xa',
        scope: { kind: 'origin', origin: 'https://localhost' },
      },
    });
  });

  it('routes chain changes to the requesting tab when the dapp origin is not the top-level tab origin', async () => {
    const { setChainIdForOrigin, EvmChainUtils, CommunicationUtils } =
      await loadTestContext();
    EvmChainUtils.getLastEvmChainIdForOrigin.mockResolvedValue('0x1');
    EvmChainUtils.getEthChainId.mockResolvedValue('0x1');
    EvmChainUtils.setChainIdForOrigin.mockResolvedValue(undefined);

    await expect(
      setChainIdForOrigin('https://iframe.example', '0xA', { tabId: 2 }),
    ).resolves.toBe('0xa');

    expect(CommunicationUtils.tabsSendMessage).toHaveBeenCalledTimes(1);
    expect(CommunicationUtils.tabsSendMessage).toHaveBeenCalledWith(2, {
      command: BackgroundCommand.SEND_EVM_EVENT_TO_CONTENT_SCRIPT,
      value: {
        eventType: 'chainChanged',
        args: '0xa',
        scope: {
          kind: 'origin',
          origin: 'https://iframe.example',
          tabId: 2,
        },
      },
    });
  });

  it('stores normalized chain whitelist entries scoped by origin', async () => {
    const {
      addWhitelistedChainForOrigin,
      isChainWhitelistedForOrigin,
      LocalStorageUtils,
    } = await loadTestContext();
    let stored: Record<string, string[]> = {};
    LocalStorageUtils.getValueFromLocalStorage.mockImplementation(() => stored);
    LocalStorageUtils.saveValueInLocalStorage.mockImplementation(
      (_key, value) => {
        stored = value;
      },
    );

    await expect(
      addWhitelistedChainForOrigin('https://example.app', '0xA'),
    ).resolves.toEqual(['0xa']);
    await addWhitelistedChainForOrigin('https://example.app', '0xa');
    await addWhitelistedChainForOrigin('https://other.app', '0x1');

    expect(stored).toEqual({
      'https://example.app': ['0xa'],
      'https://other.app': ['0x1'],
    });
    await expect(
      isChainWhitelistedForOrigin('https://example.app', '0xA'),
    ).resolves.toBe(true);
    await expect(
      isChainWhitelistedForOrigin('https://other.app', '0xa'),
    ).resolves.toBe(false);
  });

  it('removes all whitelisted chains for one origin only', async () => {
    const { removeWhitelistedChainsForOrigin, LocalStorageUtils } =
      await loadTestContext();
    let stored: Record<string, string[]> = {
      'https://example.app': ['0x1', '0xa'],
      'https://other.app': ['0x1'],
    };
    LocalStorageUtils.getValueFromLocalStorage.mockImplementation(() => stored);
    LocalStorageUtils.saveValueInLocalStorage.mockImplementation(
      (_key, value) => {
        stored = value;
      },
    );

    await removeWhitelistedChainsForOrigin('https://example.app');

    expect(stored).toEqual({
      'https://other.app': ['0x1'],
    });
  });
});
