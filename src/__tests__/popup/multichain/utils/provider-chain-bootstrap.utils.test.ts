import { BackgroundCommand } from '@reference-data/background-message-key.enum';

jest.mock('src/utils/communication.utils', () => ({
  CommunicationUtils: {
    runtimeSendMessage: jest.fn(),
  },
}));

jest.mock('@popup/multichain/utils/chain.utils', () => ({
  ChainUtils: {
    getChain: jest.fn(),
  },
}));

const loadTestContext = async () => {
  const bootstrapUtils = await import(
    '@popup/multichain/utils/provider-chain-bootstrap.utils'
  );
  const { CommunicationUtils } = await import('src/utils/communication.utils');
  const { ChainUtils } = await import('@popup/multichain/utils/chain.utils');

  return {
    ...bootstrapUtils,
    CommunicationUtils: CommunicationUtils as {
      runtimeSendMessage: jest.Mock;
    },
    ChainUtils: ChainUtils as { getChain: jest.Mock },
  };
};

describe('provider chain bootstrap', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('registers the runtime listener before sending the bootstrap request', async () => {
    const { getProviderChainWithTimeout, CommunicationUtils, ChainUtils } =
      await loadTestContext();
    const addListenerMock = jest.spyOn(chrome.runtime.onMessage, 'addListener');
    const removeListenerMock = jest.spyOn(
      chrome.runtime.onMessage,
      'removeListener',
    );
    const expectedChain = {
      chainId: '0x1',
      name: 'Ethereum',
      type: 'EVM',
      logo: '',
      rpcs: [],
    };
    ChainUtils.getChain.mockResolvedValue(expectedChain);

    const providerChainPromise = getProviderChainWithTimeout(1000);

    expect(addListenerMock).toHaveBeenCalledTimes(1);
    expect(addListenerMock.mock.invocationCallOrder[0]).toBeLessThan(
      CommunicationUtils.runtimeSendMessage.mock.invocationCallOrder[0],
    );

    const listener = addListenerMock.mock.calls[0][0];

    await listener({
      command: BackgroundCommand.SEND_BACK_CHAIN_FROM_PROVIDER,
      value: { chainId: '0x1' },
    });

    await expect(providerChainPromise).resolves.toEqual(expectedChain);
    expect(ChainUtils.getChain).toHaveBeenCalledWith('0x1');
    expect(removeListenerMock).toHaveBeenCalledWith(listener);
  });

  it('ignores empty provider responses until the timeout expires', async () => {
    const {
      getProviderChainWithTimeout,
      PROVIDER_CHAIN_BOOTSTRAP_TIMEOUT_MS,
      ChainUtils,
    } = await loadTestContext();
    const addListenerMock = jest.spyOn(chrome.runtime.onMessage, 'addListener');

    const providerChainPromise = getProviderChainWithTimeout();
    const settled = jest.fn();
    providerChainPromise.then(settled);

    const listener = addListenerMock.mock.calls[0][0];

    await listener({
      command: BackgroundCommand.SEND_BACK_CHAIN_FROM_PROVIDER,
      value: { chainId: null },
    });

    jest.advanceTimersByTime(PROVIDER_CHAIN_BOOTSTRAP_TIMEOUT_MS - 1);
    await Promise.resolve();
    expect(settled).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);

    await expect(providerChainPromise).resolves.toBeNull();
    expect(ChainUtils.getChain).not.toHaveBeenCalled();
  });


  it('returns raw chain id when the chain is not in setup', async () => {
    const { getProviderChainBootstrapResult, CommunicationUtils, ChainUtils } =
      await loadTestContext();
    const addListenerMock = jest.spyOn(chrome.runtime.onMessage, 'addListener');

    const bootstrapPromise = getProviderChainBootstrapResult(1000);
    const listener = addListenerMock.mock.calls[0][0];

    ChainUtils.getChain.mockResolvedValue(null);

    await listener({
      command: BackgroundCommand.SEND_BACK_CHAIN_FROM_PROVIDER,
      value: { chainId: '0x999' },
    });

    await expect(bootstrapPromise).resolves.toEqual({
      resolvedChain: null,
      rawChainId: '0x999',
    });
    expect(ChainUtils.getChain).toHaveBeenCalledWith('0x999');
  });

  it('falls back immediately when the bootstrap request cannot be sent', async () => {
    const { getProviderChainWithTimeout, CommunicationUtils } =
      await loadTestContext();
    const removeListenerMock = jest.spyOn(
      chrome.runtime.onMessage,
      'removeListener',
    );

    CommunicationUtils.runtimeSendMessage.mockImplementation(
      (_message: unknown, onFail?: () => void) => {
        onFail?.();
      },
    );

    await expect(getProviderChainWithTimeout(1000)).resolves.toBeNull();
    expect(removeListenerMock).toHaveBeenCalledTimes(1);
  });

  it('skips provider bootstrap when the active tab has no stored origin chain and an ecosystem chain is known', async () => {
    const { getProviderBootstrapForPopup, CommunicationUtils } =
      await loadTestContext();
    const hiveChain = {
      chainId: 'beeab0de00000000000000000000000000000000000000000000000000000000',
      name: 'HIVE',
      type: 'HIVE',
      logo: '',
      rpcs: [],
    };

    await expect(
      getProviderBootstrapForPopup({
        tabOrigin: 'https://peakd.com',
        ecosystemChain: hiveChain,
        storedOriginChainId: null,
      }),
    ).resolves.toEqual({
      resolvedChain: null,
      rawChainId: null,
    });
    expect(CommunicationUtils.runtimeSendMessage).not.toHaveBeenCalled();
  });

  it('bootstraps the provider when the active tab has no ecosystem match', async () => {
    const {
      getProviderBootstrapForPopup,
      CommunicationUtils,
      ChainUtils,
    } = await loadTestContext();
    const addListenerMock = jest.spyOn(chrome.runtime.onMessage, 'addListener');
    const expectedChain = {
      chainId: '0x2105',
      name: 'Base',
      type: 'EVM',
      logo: '',
      rpcs: [],
    };
    ChainUtils.getChain.mockResolvedValue(expectedChain);

    const bootstrapPromise = getProviderBootstrapForPopup(
      {
        tabOrigin: 'https://example.com',
        ecosystemChain: null,
        storedOriginChainId: null,
      },
      1000,
    );
    const listener = addListenerMock.mock.calls[0][0];

    await listener({
      command: BackgroundCommand.SEND_BACK_CHAIN_FROM_PROVIDER,
      value: { chainId: '0x2105' },
    });

    await expect(bootstrapPromise).resolves.toEqual({
      resolvedChain: expectedChain,
      rawChainId: '0x2105',
    });
    expect(CommunicationUtils.runtimeSendMessage).toHaveBeenCalledTimes(1);
  });

  it('awaits provider bootstrap when the active tab has a stored origin chain', async () => {
    const {
      getProviderBootstrapForPopup,
      CommunicationUtils,
      ChainUtils,
    } = await loadTestContext();
    const addListenerMock = jest.spyOn(chrome.runtime.onMessage, 'addListener');
    const expectedChain = {
      chainId: '0x1',
      name: 'Ethereum',
      type: 'EVM',
      logo: '',
      rpcs: [],
    };
    ChainUtils.getChain.mockResolvedValue(expectedChain);

    const bootstrapPromise = getProviderBootstrapForPopup(
      {
        tabOrigin: 'https://example.com',
        ecosystemChain: null,
        storedOriginChainId: '0x1',
      },
      1000,
    );
    const listener = addListenerMock.mock.calls[0][0];

    await listener({
      command: BackgroundCommand.SEND_BACK_CHAIN_FROM_PROVIDER,
      value: { chainId: '0x1' },
    });

    await expect(bootstrapPromise).resolves.toEqual({
      resolvedChain: expectedChain,
      rawChainId: '0x1',
    });
    expect(CommunicationUtils.runtimeSendMessage).toHaveBeenCalledTimes(1);
  });
});
