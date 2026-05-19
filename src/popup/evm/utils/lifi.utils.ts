import { KeychainApi } from '@api/keychain';
import { OptionItem } from '@common-ui/custom-select/custom-select.component';
import { SVGIcons } from '@common-ui/icons.enum';
import { ExtendedChain, TokenExtended } from '@lifi/types';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { LifiHistoryItem, LifiHistoryResponse } from 'hive-keychain-commons';
import { KeychainError } from 'src/keychain-error';

const ALL_CHAINS_ID = 0;

const isAllChains = (chain: ExtendedChain): boolean =>
  chain.id === ALL_CHAINS_ID;

const resolveChain = (
  chain: ExtendedChain,
  token: TokenExtended | undefined,
  chains: OptionItem[],
): ExtendedChain => {
  if (!isAllChains(chain)) {
    return chain;
  }
  if (token?.chainId != null) {
    const match = chains.find((c) => c.value.id === token.chainId);
    if (match) {
      return match.value as ExtendedChain;
    }
  }
  return chain;
};

const getLifiData = async (): Promise<any> => {
  return await KeychainApi.get(`evm/lifi/data`);
};

const getLiFiSwapOptionLists = async (): Promise<{
  tokens: OptionItem[];
  chains: OptionItem[];
}> => {
  const data = await getLifiData();
  const tokensOptions: OptionItem[] = [];
  const chainsOptions: OptionItem[] = [
    {
      label: 'All',
      value: { id: 0 } as ExtendedChain,
      img: SVGIcons.HIVE_ENGINE,
      key: 'all-chains',
    },
  ];
  for (const chainId of Object.keys(data.tokens)) {
    const chain = data.chains.find((chain: any) => {
      return chain.id.toString() === chainId.toString();
    });
    if (chain) {
      if (data.tokens[chainId].length > 0) {
        chainsOptions.push(getChainOptionItem(chain));
        for (const token of data.tokens[chainId]) {
          tokensOptions.push(getTokenOptionItem(token, chain));
        }
      }
    }
  }
  tokensOptions.sort((a, b) => b.value.fdvUSD - a.value.fdvUSD);
  return { tokens: tokensOptions, chains: chainsOptions };
};

const getTokenOptionItem = (
  token: TokenExtended,
  chain: ExtendedChain,
  chains: OptionItem[] = [],
): OptionItem => {
  const resolvedChain = resolveChain(chain, token, chains);
  return {
    label: token.symbol ?? '',
    subLabel: token.name,
    subLabelHover: EvmFormatUtils.formatAddress(token.address),
    value: token,
    img: token.logoURI,
    imgChip: resolvedChain.logoURI,
    imgChipChainName: resolvedChain.name,
    key: `${resolvedChain.id}-${token.address}`,
  };
};

const getChainOptionItem = (chain: ExtendedChain): OptionItem => {
  if (isAllChains(chain)) {
    return {
      label: 'All',
      value: chain,
      img: SVGIcons.HIVE_ENGINE,
      key: 'all-chains',
    };
  }
  return {
    label: chain.name,
    value: chain,
    img: chain.logoURI,
    key: `chain-${chain.id}`,
  };
};

const matchesTokenQuery = (token: OptionItem, query: string): boolean => {
  const normalizedQuery = query.toLowerCase();
  if (!normalizedQuery) {
    return true;
  }
  return (
    token.label?.toLowerCase().includes(normalizedQuery) ||
    !!token.subLabel?.toLowerCase().includes(normalizedQuery)
  );
};

const filterTokensByChainAndQuery = (
  tokens: OptionItem[],
  chain: ExtendedChain,
  query: string,
): OptionItem[] => {
  return tokens.filter(
    (token) =>
      (isAllChains(chain) || token.value.chainId === chain.id) &&
      matchesTokenQuery(token, query),
  );
};

const retrieveLiFiHistory = async (
  wallet: string,
): Promise<LifiHistoryItem[]> => {
  if (!wallet) return [];
  const historyResponse = (await KeychainApi.get(
    `evm/lifi/history?wallet=${encodeURIComponent(wallet)}`,
  )) as LifiHistoryResponse;
  return historyResponse?.transfers ?? [];
};

const getQuote = async ({
  fromChain,
  fromToken,
  toChain,
  toToken,
  amount,
  fromAddress,
  toAddress,
}: {
  fromChain: ExtendedChain;
  fromToken: TokenExtended;
  toChain: ExtendedChain;
  toToken: TokenExtended;
  amount: number;
  fromAddress: string;
  toAddress: string;
}) => {
  const quote = await KeychainApi.post('evm/lifi/quote', {
    fromChain: fromChain.id,
    fromToken: fromToken.address,
    toChain: toChain.id,
    toToken: toToken.address,
    amount: EvmFormatUtils.formatTokenValue(amount, toToken.decimals),
    fromAddress,
    toAddress: toAddress?.length > 0 ? toAddress : null,
  });
  if (quote.errorCode) {
    throw new KeychainError(getLiFiErrorMessage(quote.errorCode), [
      quote.errorCode,
    ]);
  } else {
    return {
      ...quote,
      estimate: {
        ...quote.estimate,
        fromAmount: EvmFormatUtils.formatTokenValue(
          quote.estimate.fromAmount,
          -fromToken.decimals,
        ).toNumber(),
        toAmount: EvmFormatUtils.formatTokenValue(
          quote.estimate.toAmount,
          -toToken.decimals,
        ).toNumber(),
        feeCosts: quote.estimate.feeCosts.map((fee: any) => ({
          ...fee,
          amount: EvmFormatUtils.formatTokenValue(
            Number(fee.amount),
            -Number(fee.token.decimals),
          ),
        })),
      },
    };
  }
};

const getLiFiErrorMessage = (errorCode: number) => {
  switch (errorCode) {
    case 1006:
      return 'evm_lifi_swap_error_no_available_quotes';
    case 1001:
      return 'evm_lifi_swap_error_same_token_source_and_destination';
    default:
      return 'swap_error_getting_estimate';
  }
};

export const LiFiUtils = {
  ALL_CHAINS_ID,
  isAllChains,
  resolveChain,
  getLifiData,
  getLiFiSwapOptionLists,
  getTokenOptionItem,
  getChainOptionItem,
  filterTokensByChainAndQuery,
  retrieveLiFiHistory,
  getQuote,
  getLiFiErrorMessage,
};
