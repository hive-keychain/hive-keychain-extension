import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { EvmEventName } from '@interfaces/evm-provider.interface';
import { EvmProvider } from 'src/content-scripts/evm/injected/provider/evm-provider';

const dispatchProviderResponse = (response: Record<string, unknown>) => {
  const event = new MessageEvent('message', {
    data: {
      type: 'evm_keychain_response',
      response,
    },
  });

  Object.defineProperty(event, 'source', {
    value: window,
  });

  window.dispatchEvent(event);
};

const dispatchRoutedEvent = ({
  eventType,
  args,
  origin,
}: {
  eventType: EvmEventName;
  args?: unknown;
  origin: string;
}) => {
  const event = new MessageEvent('message', {
    data: {
      type: 'evm_keychain_event',
      event: {
        eventType,
        args,
        scope: { kind: 'origin', origin },
      },
    },
  });

  Object.defineProperty(event, 'source', {
    value: window,
  });

  window.dispatchEvent(event);
};

const installRequestResponder = (
  responses: Partial<
    Record<
      EvmRequestMethod,
      { result: unknown; requestIdKey?: 'requestId' | 'request_id' }
    >
  >,
) => {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent;
    const response = responses[customEvent.detail.method as EvmRequestMethod];
    if (!response) return;

    dispatchProviderResponse({
      [response.requestIdKey ?? 'requestId']: customEvent.detail.request_id,
      result: response.result,
    });
  };

  document.addEventListener(EvmEventName.REQUEST, handler as EventListener);

  return () =>
    document.removeEventListener(
      EvmEventName.REQUEST,
      handler as EventListener,
    );
};

const waitForInit = async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));
};

describe('evm-provider tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('emits initial chain and accounts once on provider init', async () => {
    const cleanup = installRequestResponder({
      [EvmRequestMethod.GET_CHAIN]: { result: '0x1' },
      [EvmRequestMethod.GET_ACCOUNTS]: { result: ['0xAbC123'] },
    });
    const provider = new EvmProvider();
    const chainChangedListener = jest.fn();
    const accountsChangedListener = jest.fn();

    provider.on(EvmEventName.CHAIN_CHANGED, chainChangedListener);
    provider.on(EvmEventName.ACCOUNT_CHANGED, accountsChangedListener);

    await waitForInit();

    expect(chainChangedListener).toHaveBeenCalledTimes(1);
    expect(chainChangedListener).toHaveBeenCalledWith('0x1');
    expect(accountsChangedListener).toHaveBeenCalledTimes(1);
    expect(accountsChangedListener).toHaveBeenCalledWith(['0xabc123']);
    expect(provider.chainId).toBe('0x1');
    expect((provider as any)._accounts).toEqual(['0xabc123']);
    cleanup();
  });

  it('exposes MetaMask-compatible provider flags for legacy dapps', async () => {
    const cleanup = installRequestResponder({
      [EvmRequestMethod.GET_CHAIN]: { result: '0x1' },
      [EvmRequestMethod.GET_ACCOUNTS]: { result: [] },
    });
    const provider = new EvmProvider();

    await waitForInit();

    expect(provider.isMetaMask).toBe(true);
    expect((provider as any).autoRefreshOnNetworkChange).toBe(false);
    cleanup();
  });

  it('refreshes cached accounts from eth_accounts responses', async () => {
    const responses = {
      [EvmRequestMethod.GET_CHAIN]: { result: '0x1' },
      [EvmRequestMethod.GET_ACCOUNTS]: { result: [] },
    };
    const cleanup = installRequestResponder(responses);
    const provider = new EvmProvider();
    await waitForInit();

    responses[EvmRequestMethod.GET_ACCOUNTS] = { result: ['0xAbC123'] };

    await expect(
      provider.request({
        method: EvmRequestMethod.GET_ACCOUNTS,
        params: [],
      }),
    ).resolves.toEqual(['0xabc123']);
    expect((provider as any)._accounts).toEqual(['0xabc123']);
    cleanup();
  });

  it('accepts snake_case response ids for account requests', async () => {
    const responses = {
      [EvmRequestMethod.GET_CHAIN]: { result: '0x1' },
      [EvmRequestMethod.GET_ACCOUNTS]: { result: [] },
      [EvmRequestMethod.REQUEST_ACCOUNTS]: {
        result: ['0xDeF456'],
        requestIdKey: 'request_id' as const,
      },
    };
    const cleanup = installRequestResponder(responses);
    const provider = new EvmProvider();
    await waitForInit();

    await expect(
      provider.request({
        method: EvmRequestMethod.REQUEST_ACCOUNTS,
        params: [],
      }),
    ).resolves.toEqual(['0xdef456']);

    expect((provider as any)._accounts).toEqual([]);

    dispatchRoutedEvent({
      eventType: EvmEventName.ACCOUNT_CHANGED,
      args: ['0xDeF456'],
      origin: window.location.origin,
    });

    expect((provider as any)._accounts).toEqual(['0xdef456']);
    cleanup();
  });

  it('emits accountsChanged after eth_requestAccounts even when the response returns first', async () => {
    const responses = {
      [EvmRequestMethod.GET_CHAIN]: { result: '0x1' },
      [EvmRequestMethod.GET_ACCOUNTS]: { result: [] },
      [EvmRequestMethod.REQUEST_ACCOUNTS]: {
        result: ['0xDeF456'],
        requestIdKey: 'request_id' as const,
      },
    };
    const cleanup = installRequestResponder(responses);
    const provider = new EvmProvider();
    const accountsChangedListener = jest.fn();

    provider.on(EvmEventName.ACCOUNT_CHANGED, accountsChangedListener);
    await waitForInit();
    accountsChangedListener.mockClear();

    await expect(
      provider.request({
        method: EvmRequestMethod.REQUEST_ACCOUNTS,
        params: [],
      }),
    ).resolves.toEqual(['0xdef456']);

    dispatchRoutedEvent({
      eventType: EvmEventName.ACCOUNT_CHANGED,
      args: ['0xDeF456'],
      origin: window.location.origin,
    });

    expect(accountsChangedListener).toHaveBeenCalledTimes(1);
    expect(accountsChangedListener).toHaveBeenCalledWith(['0xdef456']);
    cleanup();
  });

  it('routes matching origin events and ignores non-matching origin events', async () => {
    const cleanup = installRequestResponder({
      [EvmRequestMethod.GET_CHAIN]: { result: '0x1' },
      [EvmRequestMethod.GET_ACCOUNTS]: { result: [] },
    });
    const provider = new EvmProvider();
    const chainChangedListener = jest.fn();
    const accountsChangedListener = jest.fn();

    provider.on(EvmEventName.CHAIN_CHANGED, chainChangedListener);
    provider.on(EvmEventName.ACCOUNT_CHANGED, accountsChangedListener);
    await waitForInit();

    chainChangedListener.mockClear();
    accountsChangedListener.mockClear();

    dispatchRoutedEvent({
      eventType: EvmEventName.CHAIN_CHANGED,
      args: '0x2',
      origin: window.location.origin,
    });
    dispatchRoutedEvent({
      eventType: EvmEventName.ACCOUNT_CHANGED,
      args: ['0xAaBbCc'],
      origin: window.location.origin,
    });
    dispatchRoutedEvent({
      eventType: EvmEventName.CHAIN_CHANGED,
      args: '0x3',
      origin: 'http://localhost:5173',
    });
    dispatchRoutedEvent({
      eventType: EvmEventName.ACCOUNT_CHANGED,
      args: ['0xDeeF00'],
      origin: 'http://localhost:5173',
    });

    expect(chainChangedListener).toHaveBeenCalledTimes(1);
    expect(chainChangedListener).toHaveBeenCalledWith('0x2');
    expect(accountsChangedListener).toHaveBeenCalledTimes(1);
    expect(accountsChangedListener).toHaveBeenCalledWith(['0xaabbcc']);
    expect(provider.chainId).toBe('0x2');
    expect((provider as any)._accounts).toEqual(['0xaabbcc']);
    cleanup();
  });

  it('dedupes identical repeated routed events', async () => {
    const cleanup = installRequestResponder({
      [EvmRequestMethod.GET_CHAIN]: { result: '0x1' },
      [EvmRequestMethod.GET_ACCOUNTS]: { result: [] },
    });
    const provider = new EvmProvider();
    const chainChangedListener = jest.fn();
    const accountsChangedListener = jest.fn();

    provider.on(EvmEventName.CHAIN_CHANGED, chainChangedListener);
    provider.on(EvmEventName.ACCOUNT_CHANGED, accountsChangedListener);
    await waitForInit();

    chainChangedListener.mockClear();
    accountsChangedListener.mockClear();

    dispatchRoutedEvent({
      eventType: EvmEventName.CHAIN_CHANGED,
      args: '0x2',
      origin: window.location.origin,
    });
    dispatchRoutedEvent({
      eventType: EvmEventName.CHAIN_CHANGED,
      args: '0x2',
      origin: window.location.origin,
    });
    dispatchRoutedEvent({
      eventType: EvmEventName.ACCOUNT_CHANGED,
      args: ['0xAaBbCc'],
      origin: window.location.origin,
    });
    dispatchRoutedEvent({
      eventType: EvmEventName.ACCOUNT_CHANGED,
      args: ['0xaabbcc'],
      origin: window.location.origin,
    });

    expect(chainChangedListener).toHaveBeenCalledTimes(1);
    expect(accountsChangedListener).toHaveBeenCalledTimes(1);
    cleanup();
  });

  it('does not emit chainChanged optimistically for wallet_switchEthereumChain', async () => {
    const cleanup = installRequestResponder({
      [EvmRequestMethod.GET_CHAIN]: { result: '0x1' },
      [EvmRequestMethod.GET_ACCOUNTS]: { result: [] },
      [EvmRequestMethod.WALLET_SWITCH_ETHEREUM_CHAIN]: { result: null },
    });
    const provider = new EvmProvider();
    const chainChangedListener = jest.fn();

    provider.on(EvmEventName.CHAIN_CHANGED, chainChangedListener);
    await waitForInit();

    chainChangedListener.mockClear();

    await expect(
      provider.request({
        method: EvmRequestMethod.WALLET_SWITCH_ETHEREUM_CHAIN,
        params: [{ chainId: '0x2' }],
      }),
    ).resolves.toBeNull();

    expect(chainChangedListener).not.toHaveBeenCalled();
    expect(provider.chainId).toBe('0x1');

    dispatchRoutedEvent({
      eventType: EvmEventName.CHAIN_CHANGED,
      args: '0x2',
      origin: window.location.origin,
    });

    expect(chainChangedListener).toHaveBeenCalledTimes(1);
    expect(chainChangedListener).toHaveBeenCalledWith('0x2');
    expect(provider.chainId).toBe('0x2');
    cleanup();
  });

  it('emits the legacy networkChanged event when the chain changes', async () => {
    const cleanup = installRequestResponder({
      [EvmRequestMethod.GET_CHAIN]: { result: '0x1' },
      [EvmRequestMethod.GET_ACCOUNTS]: { result: [] },
    });
    const provider = new EvmProvider();
    const networkChangedListener = jest.fn();

    provider.on('networkChanged', networkChangedListener);
    await waitForInit();

    networkChangedListener.mockClear();

    dispatchRoutedEvent({
      eventType: EvmEventName.CHAIN_CHANGED,
      args: '0xa4b1',
      origin: window.location.origin,
    });

    expect(networkChangedListener).toHaveBeenCalledTimes(1);
    expect(networkChangedListener).toHaveBeenCalledWith('42161');
    cleanup();
  });

  it('distinguishes origin by protocol and port', async () => {
    const cleanup = installRequestResponder({
      [EvmRequestMethod.GET_CHAIN]: { result: '0x1' },
      [EvmRequestMethod.GET_ACCOUNTS]: { result: [] },
    });
    const provider = new EvmProvider();
    const accountsChangedListener = jest.fn();

    provider.on(EvmEventName.ACCOUNT_CHANGED, accountsChangedListener);
    await waitForInit();

    accountsChangedListener.mockClear();

    dispatchRoutedEvent({
      eventType: EvmEventName.ACCOUNT_CHANGED,
      args: ['0x1111'],
      origin: 'http://localhost:5173',
    });
    dispatchRoutedEvent({
      eventType: EvmEventName.ACCOUNT_CHANGED,
      args: ['0x2222'],
      origin: 'https://localhost',
    });

    expect(accountsChangedListener).not.toHaveBeenCalled();
    cleanup();
  });
});
