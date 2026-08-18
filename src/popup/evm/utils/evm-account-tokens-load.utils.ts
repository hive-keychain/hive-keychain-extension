import {
  EvmActiveAccountLoadMetadata,
  NativeAndErc20Token,
} from '@popup/evm/interfaces/active-account.interface';
import {
  EVMSmartContractType,
  EvmSmartContractInfoErc20,
  EvmSmartContractInfoNative,
} from '@popup/evm/interfaces/evm-tokens.interface';
import {
  CatchupStatus,
  DiscoveredToken,
  DiscoveredTokensResponse,
  EvmLightNodeUtils,
  PricingStatus,
} from '@popup/evm/utils/evm-light-node.utils';
import { EvmDiscoveryCacheUtils } from '@popup/evm/utils/evm-discovery-cache.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { AsyncUtils } from 'src/utils/async.utils';
import Logger from 'src/utils/logger.utils';

const LOAD_MORE_TOKENS_INITIAL_DELAY_MS = 1000;
const LOAD_MORE_TOKENS_MAX_DELAY_MS = 30000;
const DEFAULT_MAX_LOAD_MORE_RETRIES = 5;

export type LoadNativeAndErc20TokensResult = {
  balances: NativeAndErc20Token[];
  shouldLoadMore: boolean;
} & EvmActiveAccountLoadMetadata;

const getWalletAddressForLoading = (walletAddress: string): string =>
  process.env.FORCED_EVM_WALLET_ADDRESS ?? walletAddress;

const getLoadMoreTokensRetryDelay = (retryCount: number): number =>
  Math.min(
    LOAD_MORE_TOKENS_INITIAL_DELAY_MS * 2 ** retryCount,
    LOAD_MORE_TOKENS_MAX_DELAY_MS,
  );

const shouldLoadMoreDiscoveredAssets = (
  result: DiscoveredTokensResponse,
): boolean => {
  const shouldLoadMoreCatchup = result.catchupStatus === CatchupStatus.RUNNING;
  return (
    shouldLoadMoreCatchup ||
    !result.pricingStatus ||
    result.pricingStatus !== PricingStatus.READY
  );
};

const saveDiscoveredTokensCache = async (
  chain: EvmChain,
  walletAddress: string,
  result: DiscoveredTokensResponse,
) => {
  try {
    await EvmDiscoveryCacheUtils.saveDiscoveredTokens(
      chain.chainId,
      walletAddress,
      result,
    );
  } catch (error) {
    Logger.error('Error while caching discovered EVM tokens', error);
  }
};

const getFallbackNativeTokenBalances = async (
  chain: EvmChain,
  walletAddress: string,
): Promise<LoadNativeAndErc20TokensResult> => {
  const nativeMeta = EvmTokensUtils.buildFallbackNativeTokenInfo(chain);
  const customTokenInfos = await EvmTokensUtils.getCustomErc20TokenInfos(
    chain,
    getWalletAddressForLoading(walletAddress),
  );
  const tokenInfos = EvmTokensUtils.mergeCustomErc20TokenInfos(
    [nativeMeta],
    customTokenInfos,
  );
  const balances = await EvmTokensUtils.getTokenBalances(
    getWalletAddressForLoading(walletAddress),
    chain,
    tokenInfos,
  );

  return {
    balances,
    shouldLoadMore: false,
    source: 'fallback',
    lightNodeUnavailable: true,
  };
};

const getTokenInfosWithCustomErc20 = async (
  chain: EvmChain,
  walletAddress: string,
  tokenInfos: (EvmSmartContractInfoNative | EvmSmartContractInfoErc20)[],
) => {
  const customTokenInfos = await EvmTokensUtils.getCustomErc20TokenInfos(
    chain,
    getWalletAddressForLoading(walletAddress),
  );

  return EvmTokensUtils.mergeCustomErc20TokenInfos(tokenInfos, customTokenInfos);
};

const isNativeOrErc20TokenInfo = (
  token: DiscoveredToken,
): token is EvmSmartContractInfoNative | EvmSmartContractInfoErc20 =>
  token.type === EVMSmartContractType.ERC20 ||
  token.type === EVMSmartContractType.NATIVE;

const getVisibleNativeAndErc20Tokens = async (
  balances: NativeAndErc20Token[],
): Promise<NativeAndErc20Token[]> => {
  const filtered = (await EvmTokensUtils.filterTokensBasedOnSettings(
    balances,
  )) as NativeAndErc20Token[];

  return EvmTokensUtils.sortTokens(filtered);
};

type LoadNativeAndErc20TokensForChainOptions = {
  registerAddress?: boolean;
  shouldContinue?: () => boolean;
};

const isLoadCancelled = (
  options?: LoadNativeAndErc20TokensForChainOptions,
) => options?.shouldContinue?.() === false;

const loadNativeAndErc20TokensForChain = async (
  chain: EvmChain,
  walletAddress: string,
  options?: LoadNativeAndErc20TokensForChainOptions,
): Promise<LoadNativeAndErc20TokensResult> => {
  const address = getWalletAddressForLoading(walletAddress);

  if (chain.isCustom === true) {
    const nativeMeta = EvmTokensUtils.buildFallbackNativeTokenInfo(chain);
    const tokenInfos = await getTokenInfosWithCustomErc20(chain, walletAddress, [
      nativeMeta,
    ]);
    const balances = await EvmTokensUtils.getTokenBalances(
      address,
      chain,
      tokenInfos,
    );

    return { balances, shouldLoadMore: false };
  }

  if (options?.registerAddress !== false) {
    try {
      await EvmLightNodeUtils.registerAddress(chain.chainId, walletAddress, false);
    } catch (error) {
      Logger.error('Error while registering EVM address with light node', error);
    }
  }

  if (isLoadCancelled(options)) {
    return { balances: [], shouldLoadMore: false };
  }

  let result: DiscoveredTokensResponse;
  let loadMetadata: EvmActiveAccountLoadMetadata = {};

  try {
    result = await EvmLightNodeUtils.getDiscoveredTokens(chain.chainId, address);
    if (!Array.isArray(result?.tokens)) {
      throw new Error('Invalid discovered tokens response');
    }
    void saveDiscoveredTokensCache(chain, address, result);
  } catch (error) {
    Logger.error('Error while loading discovered EVM tokens', error);
    const cached = await EvmDiscoveryCacheUtils.getDiscoveredTokens(
      chain.chainId,
      address,
    );

    if (isLoadCancelled(options)) {
      return { balances: [], shouldLoadMore: false };
    }

    if (!cached?.response || !Array.isArray(cached.response.tokens)) {
      return getFallbackNativeTokenBalances(chain, walletAddress);
    }

    result = cached.response;
    loadMetadata = {
      source: 'cache',
      cacheUpdatedAt: cached.updatedAt,
      lightNodeUnavailable: true,
    };
  }

  if (isLoadCancelled(options)) {
    return { balances: [], shouldLoadMore: false, ...loadMetadata };
  }

  const tokenInfos = await getTokenInfosWithCustomErc20(
    chain,
    walletAddress,
    result.tokens.filter(isNativeOrErc20TokenInfo),
  );
  const balances = await EvmTokensUtils.getTokenBalances(
    address,
    chain,
    tokenInfos,
  );

  return {
    balances,
    shouldLoadMore: loadMetadata.lightNodeUnavailable
      ? false
      : shouldLoadMoreDiscoveredAssets(result),
    ...loadMetadata,
  };
};

const loadVisibleNativeAndErc20TokensForChain = async (
  chain: EvmChain,
  walletAddress: string,
  retryCount = 0,
  previousBalances: NativeAndErc20Token[] = [],
  maxRetries = DEFAULT_MAX_LOAD_MORE_RETRIES,
  options?: {
    onUpdate?: (tokens: NativeAndErc20Token[]) => void;
    shouldContinue?: () => boolean;
  },
): Promise<NativeAndErc20Token[]> => {
  const { balances, shouldLoadMore } = await loadNativeAndErc20TokensForChain(
    chain,
    walletAddress,
    {
      registerAddress: retryCount === 0,
      shouldContinue: options?.shouldContinue,
    },
  );
  const nextBalances =
    balances.length === 0 && previousBalances.length > 0
      ? previousBalances
      : balances;
  const visibleTokens = await getVisibleNativeAndErc20Tokens(nextBalances);
  if (options?.shouldContinue?.() !== false) {
    options?.onUpdate?.(visibleTokens);
  }

  if (
    !shouldLoadMore ||
    retryCount >= maxRetries ||
    options?.shouldContinue?.() === false
  ) {
    return visibleTokens;
  }

  await AsyncUtils.sleep(getLoadMoreTokensRetryDelay(retryCount));
  return loadVisibleNativeAndErc20TokensForChain(
    chain,
    walletAddress,
    retryCount + 1,
    nextBalances,
    maxRetries,
    options,
  );
};

type LoadVisibleNativeAndErc20TokensForSetupChainsOptions = {
  maxRetries?: number;
  onChainUpdate?: (chain: EvmChain, tokens: NativeAndErc20Token[]) => void;
  onChainReady?: (chain: EvmChain, tokens: NativeAndErc20Token[]) => void;
  onChainError?: (chain: EvmChain, error: unknown) => void;
  onChainFinished?: (chain: EvmChain) => void;
  shouldContinue?: () => boolean;
};

const loadVisibleNativeAndErc20TokensForSetupChains = async (
  chains: EvmChain[],
  walletAddress: string,
  options?: LoadVisibleNativeAndErc20TokensForSetupChainsOptions,
): Promise<NativeAndErc20Token[]> => {
  const tokensPerChain = await Promise.all(
    chains.map(async (chain) => {
      try {
        const tokens = await loadVisibleNativeAndErc20TokensForChain(
          chain,
          walletAddress,
          0,
          [],
          options?.maxRetries,
          {
            onUpdate: (tokens) => options?.onChainUpdate?.(chain, tokens),
            shouldContinue: options?.shouldContinue,
          },
        );
        if (options?.shouldContinue?.() !== false) {
          options?.onChainReady?.(chain, tokens);
        }
        return tokens;
      } catch (error) {
        options?.onChainError?.(chain, error);
        return [];
      } finally {
        options?.onChainFinished?.(chain);
      }
    }),
  );

  return tokensPerChain.flat();
};

export const EvmAccountTokensLoadUtils = {
  DEFAULT_MAX_LOAD_MORE_RETRIES,
  getLoadMoreTokensRetryDelay,
  getVisibleNativeAndErc20Tokens,
  loadNativeAndErc20TokensForChain,
  loadVisibleNativeAndErc20TokensForChain,
  loadVisibleNativeAndErc20TokensForSetupChains,
  shouldLoadMoreDiscoveredAssets,
};
