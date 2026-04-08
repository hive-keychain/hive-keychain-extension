import {
  afterEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
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

const dispatchProviderEvent = (eventData: Record<string, unknown>) => {
  const event = new MessageEvent('message', {
    data: {
      type: 'evm_keychain_event',
      event: eventData,
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
    expect((provider as any)._accounts).toEqual(['0xdef456']);
    cleanup();
  });

  it('does not emit or cache a chain change before a confirmed switch event arrives', async () => {
    const cleanup = installRequestResponder({
      [EvmRequestMethod.GET_CHAIN]: { result: '0x1' },
      [EvmRequestMethod.GET_ACCOUNTS]: { result: [] },
      [EvmRequestMethod.WALLET_SWITCH_ETHEREUM_CHAIN]: { result: null },
    });
    const provider = new EvmProvider();
    const chainChangedListener = jest.fn();
    provider.on('chainChanged', chainChangedListener);
    await waitForInit();

    await expect(
      provider.request({
        method: EvmRequestMethod.WALLET_SWITCH_ETHEREUM_CHAIN,
        params: [{ chainId: '0x89' }],
      }),
    ).resolves.toBeNull();

    expect(provider.chainId).toBe('0x1');
    expect(chainChangedListener).not.toHaveBeenCalled();

    dispatchProviderEvent({
      eventType: EvmEventName.CHAIN_CHANGED,
      args: '0x89',
      scope: { kind: 'domain', domain: window.location.origin },
    });

    expect(provider.chainId).toBe('0x89');
    expect(chainChangedListener).toHaveBeenCalledTimes(1);
    expect(chainChangedListener).toHaveBeenCalledWith('0x89');
    cleanup();
  });

  it('does not suppress later confirmed wallet-driven chain changes after a dapp switch request', async () => {
    const cleanup = installRequestResponder({
      [EvmRequestMethod.GET_CHAIN]: { result: '0x1' },
      [EvmRequestMethod.GET_ACCOUNTS]: { result: [] },
      [EvmRequestMethod.WALLET_SWITCH_ETHEREUM_CHAIN]: { result: null },
    });
    const provider = new EvmProvider();
    const chainChangedListener = jest.fn();
    provider.on('chainChanged', chainChangedListener);
    await waitForInit();

    await provider.request({
      method: EvmRequestMethod.WALLET_SWITCH_ETHEREUM_CHAIN,
      params: [{ chainId: '0x89' }],
    });

    dispatchProviderEvent({
      eventType: EvmEventName.CHAIN_CHANGED,
      args: '0x89',
      scope: { kind: 'domain', domain: window.location.origin },
    });
    dispatchProviderEvent({
      eventType: EvmEventName.CHAIN_CHANGED,
      args: '0x1',
      scope: { kind: 'global' },
    });

    expect(provider.chainId).toBe('0x1');
    expect(chainChangedListener).toHaveBeenCalledTimes(2);
    expect(chainChangedListener.mock.calls).toEqual([['0x89'], ['0x1']]);
    cleanup();
  });

  it('normalizes account change events before caching them', async () => {
    const cleanup = installRequestResponder({
      [EvmRequestMethod.GET_CHAIN]: { result: '0x1' },
      [EvmRequestMethod.GET_ACCOUNTS]: { result: [] },
    });
    const provider = new EvmProvider();
    await waitForInit();

    const event = new MessageEvent('message', {
      data: {
        type: 'evm_keychain_event',
        event: {
          eventType: EvmEventName.ACCOUNT_CHANGED,
          args: ['0xAaBbCc'],
          scope: { kind: 'domain', domain: window.location.origin },
        },
      },
    });

    Object.defineProperty(event, 'source', {
      value: window,
    });

    window.dispatchEvent(event);

    expect((provider as any)._accounts).toEqual(['0xaabbcc']);
    cleanup();
  });

  it('ignores routed chain events from a different origin', async () => {
    const cleanup = installRequestResponder({
      [EvmRequestMethod.GET_CHAIN]: { result: '0x1' },
      [EvmRequestMethod.GET_ACCOUNTS]: { result: [] },
    });
    const provider = new EvmProvider();
    const chainChangedListener = jest.fn();
    provider.on('chainChanged', chainChangedListener);
    await waitForInit();

    dispatchProviderEvent({
      eventType: EvmEventName.CHAIN_CHANGED,
      args: '0x89',
      scope: { kind: 'domain', domain: 'http://localhost:3000' },
    });

    expect(provider.chainId).toBe('0x1');
    expect(chainChangedListener).not.toHaveBeenCalled();
    cleanup();
  });
});
