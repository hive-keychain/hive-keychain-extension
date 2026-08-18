import { NativeAndErc20Token } from '@popup/evm/interfaces/active-account.interface';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmAccountTokensLoadUtils } from '@popup/evm/utils/evm-account-tokens-load.utils';
import { EvmDiscoveryCacheUtils } from '@popup/evm/utils/evm-discovery-cache.utils';
import {
  CatchupStatus,
  DiscoveredTokensResponse,
  EvmLightNodeUtils,
  PricingStatus,
} from '@popup/evm/utils/evm-light-node.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { ChainType, EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { AsyncUtils } from 'src/utils/async.utils';

const ethereumChain: EvmChain = {
  name: 'Ethereum',
  type: ChainType.EVM,
  logo: 'ethereum.svg',
  chainId: '0x1',
  rpcs: [{ url: 'https://ethereum.rpc' }],
  mainToken: 'ETH',
  defaultTransactionType: 2 as never,
};

const nativeToken = {
  tokenInfo: {
    type: EVMSmartContractType.NATIVE,
    symbol: 'ETH',
    chainId: '0x1',
    priceUsd: 100,
    logo: 'eth.svg',
  },
  formattedBalance: '1',
  balance: 1n,
  balanceInteger: 1,
  shortFormattedBalance: '1',
} as NativeAndErc20Token;

const discoveredTokensResponse: DiscoveredTokensResponse = {
  address: '0xabc',
  chainId: '1',
  tokens: [
    {
      type: EVMSmartContractType.NATIVE,
      name: 'Ethereum',
      symbol: 'ETH',
      logo: 'eth.svg',
      chainId: '1',
      backgroundColor: '',
      priceUsd: 100,
      coingeckoId: 'ethereum',
      createdAt: '',
      categories: [],
    },
  ],
  catchupStatus: CatchupStatus.DONE,
  pricingStatus: PricingStatus.READY,
};

describe('EvmAccountTokensLoadUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(EvmLightNodeUtils, 'registerAddress').mockResolvedValue(undefined);
    jest
      .spyOn(EvmLightNodeUtils, 'getDiscoveredTokens')
      .mockResolvedValue(discoveredTokensResponse);
    jest
      .spyOn(EvmDiscoveryCacheUtils, 'saveDiscoveredTokens')
      .mockResolvedValue({ updatedAt: 1, response: discoveredTokensResponse });
    jest
      .spyOn(EvmDiscoveryCacheUtils, 'getDiscoveredTokens')
      .mockResolvedValue(null);
    jest
      .spyOn(EvmTokensUtils, 'getCustomErc20TokenInfos')
      .mockResolvedValue([]);
    jest.spyOn(EvmTokensUtils, 'getTokenBalances').mockResolvedValue([nativeToken]);
    jest
      .spyOn(EvmTokensUtils, 'filterTokensBasedOnSettings')
      .mockImplementation(async (tokens) => tokens);
    jest.spyOn(EvmTokensUtils, 'sortTokens').mockImplementation((tokens) => tokens);
    jest.spyOn(AsyncUtils, 'sleep').mockResolvedValue(undefined);
  });

  it('registers the address and refreshes balances from rpc on first load', async () => {
    const result = await EvmAccountTokensLoadUtils.loadNativeAndErc20TokensForChain(
      ethereumChain,
      '0xabc',
    );

    expect(EvmLightNodeUtils.registerAddress).toHaveBeenCalledWith(
      ethereumChain.chainId,
      '0xabc',
      false,
    );
    expect(EvmLightNodeUtils.getDiscoveredTokens).toHaveBeenCalledWith(
      ethereumChain.chainId,
      '0xabc',
    );
    expect(EvmTokensUtils.getTokenBalances).toHaveBeenCalled();
    expect(result.balances).toEqual([nativeToken]);
    expect(result.shouldLoadMore).toBe(false);
  });

  it('caches successful light-node token discovery responses', async () => {
    await EvmAccountTokensLoadUtils.loadNativeAndErc20TokensForChain(
      ethereumChain,
      '0xabc',
    );

    expect(EvmDiscoveryCacheUtils.saveDiscoveredTokens).toHaveBeenCalledWith(
      ethereumChain.chainId,
      '0xabc',
      discoveredTokensResponse,
    );
  });

  it('merges saved custom tokens with discovered tokens on default chains', async () => {
    const customToken = {
      type: EVMSmartContractType.ERC20,
      name: 'Custom Token',
      symbol: 'CUS',
      decimals: 6,
      logo: '',
      chainId: ethereumChain.chainId,
      contractAddress: '0x00000000000000000000000000000000000000aa',
      backgroundColor: '',
      priceUsd: 0,
      possibleSpam: false,
      verifiedContract: true,
      isProxy: false,
      proxyTarget: null,
      validated: 0,
    };
    (
      EvmTokensUtils.getCustomErc20TokenInfos as jest.Mock
    ).mockResolvedValue([customToken]);

    await EvmAccountTokensLoadUtils.loadNativeAndErc20TokensForChain(
      ethereumChain,
      '0xabc',
    );

    expect(EvmTokensUtils.getTokenBalances).toHaveBeenCalledWith(
      '0xabc',
      ethereumChain,
      expect.arrayContaining([
        discoveredTokensResponse.tokens[0],
        customToken,
      ]),
    );
  });

  it('skips address registration on refresh loads', async () => {
    await EvmAccountTokensLoadUtils.loadNativeAndErc20TokensForChain(
      ethereumChain,
      '0xabc',
      { registerAddress: false },
    );

    expect(EvmLightNodeUtils.registerAddress).not.toHaveBeenCalled();
  });

  it('loads visible tokens for each setup chain', async () => {
    const tokens =
      await EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForSetupChains(
        [ethereumChain],
        '0xabc',
      );

    expect(EvmLightNodeUtils.registerAddress).toHaveBeenCalledWith(
      ethereumChain.chainId,
      '0xabc',
      false,
    );
    expect(EvmLightNodeUtils.getDiscoveredTokens).toHaveBeenCalledWith(
      ethereumChain.chainId,
      '0xabc',
    );
    expect(EvmTokensUtils.getTokenBalances).toHaveBeenCalled();
    expect(EvmTokensUtils.filterTokensBasedOnSettings).toHaveBeenCalled();
    expect(EvmTokensUtils.sortTokens).toHaveBeenCalled();
    expect(tokens).toEqual([nativeToken]);
  });

  it('starts setup-chain loads in parallel', async () => {
    const polygonChain: EvmChain = {
      ...ethereumChain,
      name: 'Polygon',
      chainId: '0x89',
      mainToken: 'MATIC',
    };
    const discoveryResolvers = new Map<
      string,
      (response: DiscoveredTokensResponse) => void
    >();
    let resolveBothStarted: () => void = () => undefined;
    const bothStarted = new Promise<void>((resolve) => {
      resolveBothStarted = resolve;
    });
    (EvmLightNodeUtils.getDiscoveredTokens as jest.Mock).mockImplementation(
      (chainId: string) =>
        new Promise((resolve) => {
          discoveryResolvers.set(chainId, resolve);
          if (discoveryResolvers.size === 2) {
            resolveBothStarted();
          }
        }),
    );

    const loadPromise =
      EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForSetupChains(
        [ethereumChain, polygonChain],
        '0xabc',
      );
    await bothStarted;

    expect(EvmLightNodeUtils.getDiscoveredTokens).toHaveBeenCalledTimes(2);
    discoveryResolvers.get(ethereumChain.chainId)?.({
      ...discoveredTokensResponse,
      chainId: ethereumChain.chainId,
    });
    discoveryResolvers.get(polygonChain.chainId)?.({
      ...discoveredTokensResponse,
      chainId: polygonChain.chainId,
    });
    await loadPromise;
  });

  it('falls back per setup chain when discovery fails', async () => {
    const polygonChain: EvmChain = {
      ...ethereumChain,
      name: 'Polygon',
      chainId: '0x89',
      mainToken: 'MATIC',
    };
    const failedChains: string[] = [];
    const finishedChains: string[] = [];

    (EvmLightNodeUtils.getDiscoveredTokens as jest.Mock).mockImplementation(
      async (chainId: string) => {
        if (chainId === '0x89') {
          throw new Error('polygon unavailable');
        }

        return {
          address: '0xabc',
          chainId: '1',
          tokens: [
            {
              type: EVMSmartContractType.NATIVE,
              symbol: 'ETH',
            },
          ],
          catchupStatus: CatchupStatus.DONE,
          pricingStatus: PricingStatus.READY,
        };
      },
    );

    const tokens =
      await EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForSetupChains(
        [ethereumChain, polygonChain],
        '0xabc',
        {
          onChainError: (chain) => {
            failedChains.push(chain.name);
          },
          onChainFinished: (chain) => {
            finishedChains.push(chain.name);
          },
        },
      );

    expect(tokens).toEqual([nativeToken, nativeToken]);
    expect(failedChains).toEqual([]);
    expect(finishedChains).toHaveLength(2);
    expect(finishedChains).toEqual(
      expect.arrayContaining(['Ethereum', 'Polygon']),
    );
  });

  it('uses cached token metadata on light-node failure and refreshes balances through rpc', async () => {
    const cachedToken = {
      type: EVMSmartContractType.ERC20,
      name: 'USD Coin',
      symbol: 'USDC',
      logo: '',
      chainId: '1',
      backgroundColor: '',
      priceUsd: 1,
      contractAddress: '0x00000000000000000000000000000000000000aa',
      possibleSpam: false,
      verifiedContract: true,
      isProxy: false,
      proxyTarget: null,
      decimals: 6,
      validated: 1,
    };
    const cachedResponse: DiscoveredTokensResponse = {
      address: '0xabc',
      chainId: '1',
      tokens: [cachedToken],
      catchupStatus: CatchupStatus.RUNNING,
      pricingStatus: PricingStatus.PENDING,
    };
    const cachedBalance = {
      ...nativeToken,
      tokenInfo: cachedToken,
    } as NativeAndErc20Token;

    (EvmLightNodeUtils.getDiscoveredTokens as jest.Mock).mockRejectedValue(
      new Error('light node unavailable'),
    );
    (
      EvmDiscoveryCacheUtils.getDiscoveredTokens as jest.Mock
    ).mockResolvedValue({
      updatedAt: 123,
      response: cachedResponse,
    });
    (EvmTokensUtils.getTokenBalances as jest.Mock).mockResolvedValue([
      cachedBalance,
    ]);

    const result =
      await EvmAccountTokensLoadUtils.loadNativeAndErc20TokensForChain(
        ethereumChain,
        '0xabc',
      );

    expect(EvmTokensUtils.getTokenBalances).toHaveBeenCalledWith(
      '0xabc',
      ethereumChain,
      [cachedToken],
    );
    expect(result).toMatchObject({
      balances: [cachedBalance],
      shouldLoadMore: false,
      source: 'cache',
      cacheUpdatedAt: 123,
      lightNodeUnavailable: true,
    });
  });

  it('falls back to native token balances when light-node fails with no cache', async () => {
    (EvmLightNodeUtils.getDiscoveredTokens as jest.Mock).mockRejectedValue(
      new Error('light node unavailable'),
    );
    (
      EvmDiscoveryCacheUtils.getDiscoveredTokens as jest.Mock
    ).mockResolvedValue(null);

    const result =
      await EvmAccountTokensLoadUtils.loadNativeAndErc20TokensForChain(
        ethereumChain,
        '0xabc',
      );

    const balanceCall = (EvmTokensUtils.getTokenBalances as jest.Mock).mock
      .calls[0];
    expect(balanceCall[0]).toBe('0xabc');
    expect(balanceCall[1]).toBe(ethereumChain);
    expect(balanceCall[2][0]).toMatchObject({
      type: EVMSmartContractType.NATIVE,
      symbol: ethereumChain.mainToken,
    });
    expect(result).toMatchObject({
      balances: [nativeToken],
      shouldLoadMore: false,
      source: 'fallback',
      lightNodeUnavailable: true,
    });
  });

  it('stops retrying after the configured max retries', async () => {
    jest.spyOn(EvmLightNodeUtils, 'getDiscoveredTokens').mockResolvedValue({
      address: '0xabc',
      chainId: '1',
      tokens: [
        {
          type: EVMSmartContractType.NATIVE,
          symbol: 'ETH',
        },
      ],
      catchupStatus: CatchupStatus.RUNNING,
      pricingStatus: PricingStatus.PENDING,
    });

    const tokens = await EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForChain(
      ethereumChain,
      '0xabc',
      0,
      [],
      2,
    );

    expect(EvmLightNodeUtils.getDiscoveredTokens).toHaveBeenCalledTimes(3);
    expect(tokens).toEqual([nativeToken]);
  });

  it('publishes the first chain result before waiting for a retry', async () => {
    const runningResponse = {
      ...discoveredTokensResponse,
      catchupStatus: CatchupStatus.RUNNING,
      pricingStatus: PricingStatus.PENDING,
    };
    (EvmLightNodeUtils.getDiscoveredTokens as jest.Mock)
      .mockResolvedValueOnce(runningResponse)
      .mockResolvedValueOnce(discoveredTokensResponse);
    let resolveSleep: (() => void) | undefined;
    const sleepStarted = new Promise<void>((resolveStarted) => {
      (AsyncUtils.sleep as jest.Mock).mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveSleep = resolve;
            resolveStarted();
          }),
      );
    });
    const onUpdate = jest.fn();

    const loadPromise =
      EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForChain(
        ethereumChain,
        '0xabc',
        0,
        [],
        1,
        { onUpdate },
      );

    await sleepStarted;
    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate).toHaveBeenLastCalledWith([nativeToken]);

    resolveSleep?.();
    await loadPromise;
    expect(onUpdate).toHaveBeenCalledTimes(2);
  });

  it('keeps prior balances when a retry temporarily returns empty', async () => {
    const runningResponse = {
      ...discoveredTokensResponse,
      catchupStatus: CatchupStatus.RUNNING,
      pricingStatus: PricingStatus.PENDING,
    };
    (EvmLightNodeUtils.getDiscoveredTokens as jest.Mock)
      .mockResolvedValueOnce(runningResponse)
      .mockResolvedValueOnce(discoveredTokensResponse);
    (EvmTokensUtils.getTokenBalances as jest.Mock)
      .mockResolvedValueOnce([nativeToken])
      .mockResolvedValueOnce([]);
    const onUpdate = jest.fn();

    await EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForChain(
      ethereumChain,
      '0xabc',
      0,
      [],
      1,
      { onUpdate },
    );

    expect(onUpdate).toHaveBeenNthCalledWith(1, [nativeToken]);
    expect(onUpdate).toHaveBeenNthCalledWith(2, [nativeToken]);
  });

  it('stops obsolete account retries after cancellation', async () => {
    const runningResponse = {
      ...discoveredTokensResponse,
      catchupStatus: CatchupStatus.RUNNING,
      pricingStatus: PricingStatus.PENDING,
    };
    (EvmLightNodeUtils.getDiscoveredTokens as jest.Mock).mockResolvedValue(
      runningResponse,
    );
    let resolveSleep: (() => void) | undefined;
    const sleepStarted = new Promise<void>((resolveStarted) => {
      (AsyncUtils.sleep as jest.Mock).mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveSleep = resolve;
            resolveStarted();
          }),
      );
    });
    let shouldContinue = true;
    const onUpdate = jest.fn();

    const loadPromise =
      EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForChain(
        ethereumChain,
        '0xabc',
        0,
        [],
        5,
        { onUpdate, shouldContinue: () => shouldContinue },
      );
    await sleepStarted;
    shouldContinue = false;
    resolveSleep?.();
    await loadPromise;

    expect(EvmLightNodeUtils.getDiscoveredTokens).toHaveBeenCalledTimes(1);
    expect(onUpdate).toHaveBeenCalledTimes(1);
  });

  it('does not wait for discovery cache writes before publishing balances', async () => {
    (
      EvmDiscoveryCacheUtils.saveDiscoveredTokens as jest.Mock
    ).mockImplementation(() => new Promise(() => undefined));
    const onUpdate = jest.fn();

    await EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForChain(
      ethereumChain,
      '0xabc',
      0,
      [],
      0,
      { onUpdate },
    );

    expect(onUpdate).toHaveBeenCalledWith([nativeToken]);
  });
});
