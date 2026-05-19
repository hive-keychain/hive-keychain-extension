import { KeychainApi } from '@api/keychain';
import { OptionItem } from '@common-ui/custom-select/custom-select.component';
import { SVGIcons } from '@common-ui/icons.enum';
import { ExtendedChain, TokenExtended } from '@lifi/types';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { ethers } from 'ethers';
import { LifiHistoryItem, LifiHistoryResponse } from 'hive-keychain-commons';
import { KeychainError } from 'src/keychain-error';

const ALL_CHAINS_ID = 0;

type LiFiToolErrorCode =
  | 'NO_POSSIBLE_ROUTE'
  | 'INSUFFICIENT_LIQUIDITY'
  | 'TOOL_TIMEOUT'
  | 'UNKNOWN_ERROR'
  | 'RPC_ERROR'
  | 'AMOUNT_TOO_LOW'
  | 'AMOUNT_TOO_HIGH'
  | 'FEES_HIGHER_THAN_AMOUNT'
  | 'DIFFERENT_RECIPIENT_NOT_SUPPORTED'
  | 'TOOL_SPECIFIC_ERROR'
  | 'CANNOT_GUARANTEE_MIN_AMOUNT';

interface LiFiToolError {
  code?: string;
  message?: string;
  tool?: string;
}

export interface LiFiErrorResponse {
  message?: string;
  errorCode?: number;
  errors?: LiFiToolError[];
}

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

const isSameToken = (
  fromChain: ExtendedChain,
  fromToken: TokenExtended,
  toChain: ExtendedChain,
  toToken: TokenExtended,
): boolean => {
  const resolvedFromChain = isAllChains(fromChain)
    ? fromToken.chainId
    : fromChain.id;
  const resolvedToChain = isAllChains(toChain) ? toToken.chainId : toChain.id;
  return (
    resolvedFromChain === resolvedToChain &&
    fromToken.address.toLowerCase() === toToken.address.toLowerCase()
  );
};

const getMessageKeyForToolError = (code: string): string | undefined => {
  switch (code as LiFiToolErrorCode) {
    case 'NO_POSSIBLE_ROUTE':
      return 'evm_lifi_swap_error_no_available_quotes';
    case 'INSUFFICIENT_LIQUIDITY':
    case 'AMOUNT_TOO_HIGH':
      return 'evm_lifi_swap_error_amount_too_high';
    case 'AMOUNT_TOO_LOW':
      return 'evm_lifi_swap_error_amount_too_low';
    case 'FEES_HIGHER_THAN_AMOUNT':
      return 'evm_lifi_swap_error_fees_exceed_amount';
    case 'CANNOT_GUARANTEE_MIN_AMOUNT':
      return 'evm_lifi_swap_failed_slippage';
    case 'DIFFERENT_RECIPIENT_NOT_SUPPORTED':
      return 'evm_lifi_swap_error_invalid_request';
    case 'TOOL_TIMEOUT':
    case 'RPC_ERROR':
      return 'evm_lifi_swap_error_service_unavailable';
    default:
      return undefined;
  }
};

const getMessageKeyForApiErrorCode = (errorCode: number): string => {
  switch (errorCode) {
    case 1001:
      return 'evm_lifi_swap_error_build_transaction';
    case 1002:
    case 1003:
      return 'evm_lifi_swap_error_no_available_quotes';
    case 1004:
    case 1011:
    case 1013:
      return 'evm_lifi_swap_error_invalid_request';
    case 1005:
      return 'evm_lifi_swap_error_rate_limited';
    case 1007:
      return 'evm_lifi_swap_failed_slippage';
    case 1006:
    case 1008:
    case 1009:
    case 1010:
    case 1012:
      return 'evm_lifi_swap_error_service_unavailable';
    default:
      return 'swap_error_getting_estimate';
  }
};

const getMessageKeyForHttpStatus = (status: number): string => {
  switch (status) {
    case 400:
      return 'evm_lifi_swap_error_invalid_request';
    case 404:
      return 'evm_lifi_swap_error_no_available_quotes';
    case 429:
      return 'evm_lifi_swap_error_rate_limited';
    case 500:
    case 502:
    case 503:
      return 'evm_lifi_swap_error_service_unavailable';
    default:
      return 'evm_lifi_swap_error_service_unavailable';
  }
};

const getLiFiErrorMessage = (response: LiFiErrorResponse): string => {
  const toolCode = response.errors?.[0]?.code;
  if (toolCode) {
    const toolMessage = getMessageKeyForToolError(toolCode);
    if (toolMessage) {
      return toolMessage;
    }
  }
  if (response.errorCode != null) {
    return getMessageKeyForApiErrorCode(response.errorCode);
  }
  return 'swap_error_getting_estimate';
};

const throwLiFiError = (
  response: LiFiErrorResponse,
  httpStatus?: number,
): never => {
  const messageKey =
    response.errorCode != null || response.errors?.length
      ? getLiFiErrorMessage(response)
      : httpStatus != null
        ? getMessageKeyForHttpStatus(httpStatus)
        : 'evm_lifi_swap_error_service_unavailable';
  throw new KeychainError(messageKey, [response.errorCode ?? httpStatus ?? '']);
};

const getTransactionErrorMessage = (error: unknown): string => {
  if (error instanceof KeychainError) {
    return error.message;
  }
  const err = error as {
    code?: string;
    reason?: string;
    shortMessage?: string;
    message?: string;
  };
  return EthersUtils.getErrorMessage(
    err.code,
    err.reason,
    err.shortMessage,
    err.message,
  ).message;
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
  tokensOptions.sort((a, b) => {
    if (a.value.address.toLowerCase() === ethers.ZeroAddress) {
      return -1;
    }
    if (b.value.address.toLowerCase() === ethers.ZeroAddress) {
      return 1;
    }
    return b.value.fdvUSD - a.value.fdvUSD;
  });
  return { tokens: tokensOptions, chains: chainsOptions };
};

const getTokenOptionItem = (
  token: TokenExtended,
  chain: ExtendedChain,
  chains: OptionItem[] = [],
): OptionItem => {
  const resolvedChain = resolveChain(chain, token, chains);
  const isNativeToken = token.address.toLowerCase() === ethers.ZeroAddress;
  return {
    label: token.symbol ?? '',
    subLabel: isNativeToken ? '' : token.name,
    subLabelHover: isNativeToken
      ? ''
      : EvmFormatUtils.formatAddress(token.address),
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
  slippage,
}: {
  fromChain: ExtendedChain;
  fromToken: TokenExtended;
  toChain: ExtendedChain;
  toToken: TokenExtended;
  amount: number;
  fromAddress: string;
  toAddress: string;
  slippage: number;
}): Promise<any> => {
  if (isSameToken(fromChain, fromToken, toChain, toToken)) {
    throw new KeychainError(
      'evm_lifi_swap_error_same_token_source_and_destination',
    );
  }

  const { status, data } = await KeychainApi.postWithResponse(
    'evm/lifi/quote',
    {
      fromChain: fromChain.id,
      fromToken: fromToken.address,
      toChain: toChain.id,
      toToken: toToken.address,
      amount: EvmFormatUtils.formatTokenValue(
        amount,
        fromToken.decimals,
      ).toFixed(0),
      fromAddress,
      toAddress: toAddress?.length > 0 ? toAddress : null,
      slippage: slippage / 100,
    },
  );

  if (status !== 200) {
    throwLiFiError((data as LiFiErrorResponse) ?? {}, status);
  }

  const quote = data as LiFiErrorResponse & Record<string, any>;
  if (!quote || typeof quote !== 'object') {
    throw new KeychainError('evm_lifi_swap_error_service_unavailable');
  }

  if (quote.errorCode || quote.errors?.length) {
    throwLiFiError(quote);
  }

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
};

export const LiFiUtils = {
  ALL_CHAINS_ID,
  isAllChains,
  isSameToken,
  resolveChain,
  getLifiData,
  getLiFiSwapOptionLists,
  getTokenOptionItem,
  getChainOptionItem,
  filterTokensByChainAndQuery,
  retrieveLiFiHistory,
  getQuote,
  getLiFiErrorMessage,
  getTransactionErrorMessage,
};
