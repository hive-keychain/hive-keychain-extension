import { NativeAndErc20Token } from '@popup/evm/interfaces/active-account.interface';
import {
  EvmSmartContractInfo,
  EVMSmartContractType,
} from '@popup/evm/interfaces/evm-tokens.interface';
import {
  CatchupStatus,
  DiscoveredTokensResponse,
  EvmLightNodeUtils,
  PricingStatus,
} from '@popup/evm/utils/evm-light-node.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { AsyncUtils } from 'src/utils/async.utils';

const LOAD_MORE_TOKENS_INITIAL_DELAY_MS = 1000;
const LOAD_MORE_TOKENS_MAX_DELAY_MS = 30000;
const DEFAULT_MAX_LOAD_MORE_RETRIES = 5;

export type LoadNativeAndErc20TokensResult = {
  balances: NativeAndErc20Token[];
  shouldLoadMore: boolean;
};

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

const getTokenInfosWithCustomErc20 = async (
  chain: EvmChain,
  walletAddress: string,
  tokenInfos: EvmSmartContractInfo[],
) => {
  const customTokenInfos = await EvmTokensUtils.getCustomErc20TokenInfos(
    chain,
    getWalletAddressForLoading(walletAddress),
  );

  return EvmTokensUtils.mergeCustomErc20TokenInfos(tokenInfos, customTokenInfos);
};

const getVisibleNativeAndErc20Tokens = async (
  balances: NativeAndErc20Token[],
): Promise<NativeAndErc20Token[]> => {
  const filtered = (await EvmTokensUtils.filterTokensBasedOnSettings(
    balances,
  )) as NativeAndErc20Token[];

  return EvmTokensUtils.sortTokens(filtered);
};

const loadNativeAndErc20TokensForChain = async (
  chain: EvmChain,
  walletAddress: string,
  options?: { registerAddress?: boolean },
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
    await EvmLightNodeUtils.registerAddress(chain.chainId, walletAddress, false);
  }

  const result = await EvmLightNodeUtils.getDiscoveredTokens(
    chain.chainId,
    address,
  );
  const balances = await EvmTokensUtils.getTokenBalances(
    address,
    chain,
    result.tokens.filter(
      (token) =>
        token.type === EVMSmartContractType.ERC20 ||
        token.type === EVMSmartContractType.NATIVE,
    ),
  );

  return {
    balances,
    shouldLoadMore: shouldLoadMoreDiscoveredAssets(result),
  };
};

const loadVisibleNativeAndErc20TokensForChain = async (
  chain: EvmChain,
  walletAddress: string,
  retryCount = 0,
  previousBalances: NativeAndErc20Token[] = [],
  maxRetries = DEFAULT_MAX_LOAD_MORE_RETRIES,
): Promise<NativeAndErc20Token[]> => {
  const { balances, shouldLoadMore } = await loadNativeAndErc20TokensForChain(
    chain,
    walletAddress,
    { registerAddress: retryCount === 0 },
  );
  const nextBalances =
    balances.length === 0 && previousBalances.length > 0
      ? previousBalances
      : balances;
  const visibleTokens = await getVisibleNativeAndErc20Tokens(nextBalances);

  if (!shouldLoadMore || retryCount >= maxRetries) {
    return visibleTokens;
  }

  await AsyncUtils.sleep(getLoadMoreTokensRetryDelay(retryCount));
  return loadVisibleNativeAndErc20TokensForChain(
    chain,
    walletAddress,
    retryCount + 1,
    nextBalances,
    maxRetries,
  );
};

type LoadVisibleNativeAndErc20TokensForSetupChainsOptions = {
  maxRetries?: number;
  onChainReady?: (chain: EvmChain, tokens: NativeAndErc20Token[]) => void;
  onChainError?: (chain: EvmChain, error: unknown) => void;
  onChainFinished?: (chain: EvmChain) => void;
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
        );
        options?.onChainReady?.(chain, tokens);
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
