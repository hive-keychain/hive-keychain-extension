export type PortfolioMode = 'buy' | 'sell' | 'swap' | 'bridge';

export type PortfolioRouteType = 'swap' | 'bridge';

export type PortfolioExecutionType = 'in_app' | 'redirect';

export type PortfolioProviderId =
  | 'lifi'
  | 'keychain_swap'
  | 'stealthex'
  | 'simpleswap'
  | 'letsexchange'
  | 'changelly'
  | 'ramp'
  | 'transak';

export type PortfolioEcosystem = 'evm' | 'hive' | 'hive_engine';

export interface PortfolioCanonicalAsset {
  assetId: string;
  ecosystem: PortfolioEcosystem;
  symbol: string;
  name: string;
  chainId: string | null;
  address: string | null;
  decimals: number | null;
  isNative: boolean;
  familyId: string;
  logoUrl: string | null;
}

export interface PortfolioQuoteFee {
  amount: string;
  currency: string;
}

export interface PortfolioEvmTransaction {
  from: string | null;
  to: string;
  value: string;
  data: string;
  chainId: number;
  gasLimit: string | null;
  gasPrice: string | null;
  maxFeePerGas: string | null;
  maxPriorityFeePerGas: string | null;
}

export type PortfolioHiveTransferOperation = [
  'transfer',
  {
    from: string;
    to: string;
    amount: string;
    memo: string;
  },
];

export type PortfolioHiveCustomJsonOperation = [
  'custom_json',
  {
    id: string;
    json: string;
    required_auths: string[];
    required_posting_auths: string[];
  },
];

export type PortfolioHiveOperation =
  | PortfolioHiveTransferOperation
  | PortfolioHiveCustomJsonOperation;

export interface PortfolioHiveTransaction {
  method: 'active';
  operations: PortfolioHiveOperation[];
  expiration: string;
  ref_block_num: number;
  ref_block_prefix: number;
  extensions: unknown[];
}

export type PortfolioQuoteTransaction =
  | PortfolioEvmTransaction
  | PortfolioHiveTransaction;

export const isPortfolioEvmTransaction = (
  transaction: PortfolioQuoteTransaction,
): transaction is PortfolioEvmTransaction => 'chainId' in transaction;

export const isPortfolioHiveTransaction = (
  transaction: PortfolioQuoteTransaction,
): transaction is PortfolioHiveTransaction => 'operations' in transaction;

export interface PortfolioQuote {
  quoteId: string;
  provider: PortfolioProviderId | string;
  providerName: string;
  providerLogoUrl: string | null;
  category: PortfolioMode;
  routeType: PortfolioRouteType | null;
  fromAsset: PortfolioCanonicalAsset | null;
  toAsset: PortfolioCanonicalAsset | null;
  fromAmount: string;
  estimatedToAmount: string;
  comparableValue: string;
  providerFee: PortfolioQuoteFee | null;
  networkFeeEstimate: PortfolioQuoteFee | null;
  priceImpact: string | null;
  warnings: string[];
  expiresAt: string | null;
  redirectUrl: string | null;
  requiresRedirect: boolean;
  executionType: PortfolioExecutionType;
  routeMetadata: Record<string, unknown> | null;
  transaction: PortfolioQuoteTransaction | null;
}

export interface PortfolioQuoteRequestEcho {
  mode: PortfolioMode;
  routeType: PortfolioRouteType | null;
  fromAssetId: string | null;
  toAssetId: string | null;
  fiatCurrency: string | null;
  paymentMethod: string | null;
  countryCode: string | null;
  sourceChainId: string | null;
  destinationChainId: string | null;
}

export interface PortfolioQuoteResponse {
  request: PortfolioQuoteRequestEcho;
  quotes: PortfolioQuote[];
}

export interface PortfolioQuoteRequestBody {
  fromAmount: string;
  mode?: PortfolioMode;
  fromAssetId?: string;
  toAssetId?: string;
  fromAddress?: string;
  toAddress?: string;
  countryCode?: string;
  fiatCurrency?: string;
  paymentMethod?: string;
  slippage?: number;
  sourceChainId?: string;
  destinationChainId?: string;
  providers?: PortfolioProviderId[];
}

export interface PortfolioAvailableAssetsResponse {
  mode: PortfolioMode;
  direction: 'from' | 'to';
  sourceAssetId: string | null;
  assets: PortfolioCanonicalAsset[];
}

export interface PortfolioFiatRampPaymentMethod {
  id: string;
  label: string;
}

export interface PortfolioFiatRampOptions {
  fiatCurrencies: string[];
  paymentMethods: PortfolioFiatRampPaymentMethod[];
}

export interface PortfolioExecution {
  id: string;
  status: string;
  mode: string;
  provider: string;
  providerReferenceId: string | null;
  fromAssetId: string | null;
  toAssetId: string | null;
  fromAmount: string | null;
  toAmount: string | null;
  fromAddress: string | null;
  toAddress: string | null;
  transaction: PortfolioQuoteTransaction | null;
  submittedAt: string | null;
  updatedAt: string | null;
}

export interface PortfolioHistoryItem extends PortfolioExecution {
  displayStatus: string;
  executionType: PortfolioExecutionType | null;
  txHash: string | null;
}

export interface PortfolioHistoryResponse {
  page: number;
  pageSize: number;
  hasMore: boolean;
  items: PortfolioHistoryItem[];
}

export interface PortfolioRedirectOrder {
  executionId: string;
  provider: string;
  providerReferenceId: string | null;
  redirectUrl: string | null;
  deposit: {
    address: string;
    expectedAmount: string;
    symbol: string;
    network: string;
  } | null;
}

export interface PortfolioSwapAmountRangeDetails {
  fromAssetId?: string;
  toAssetId?: string;
  requestedAmount?: string;
  mergedRange?: {
    min?: string;
    max?: string;
  };
  providerRanges?: Array<{
    provider?: string;
    min?: string;
    max?: string;
  }>;
}

export interface PortfolioApiErrorPayload {
  code?: string;
  message?: string;
  requestId?: string;
  details?: PortfolioSwapAmountRangeDetails;
  error?: PortfolioApiErrorPayload;
}
