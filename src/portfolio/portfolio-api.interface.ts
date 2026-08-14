export type PortfolioMode = 'buy' | 'sell' | 'swap' | 'bridge';

export type PortfolioRouteType = 'swap' | 'bridge';

export type PortfolioExecutionType = 'in_app' | 'redirect';

export type PortfolioProviderId =
  | 'lifi'
  | 'uniswap'
  | 'zero_x'
  | 'one_inch'
  | 'socket'
  | 'keychain_swap'
  | 'stealthex'
  | 'simpleswap'
  | 'letsexchange'
  | 'changelly'
  | 'onramper'
  | 'moonpay'
  | 'ramp'
  | 'transak';

export type PortfolioEcosystem =
  | 'evm'
  | 'hive'
  | 'hive_engine'
  | 'utxo'
  | 'svm'
  | 'mvm'
  | 'tvm'
  | 'external';

export type PortfolioDestinationOnlyEcosystem = Extract<
  PortfolioEcosystem,
  'utxo' | 'svm' | 'mvm' | 'tvm' | 'external'
>;

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
  /** Spot USD price from provider sync; `0` means unknown / unavailable. */
  priceUsd: number;
  /**
   * Picker ranking score from the portfolio API.
   * Higher is better for default to-asset sort order.
   */
  rankScore: number;
}

export interface PortfolioQuoteFee {
  amount: string;
  currency: string;
}

export interface PortfolioQuoteApproval {
  spender: string;
  amount: string;
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
  approval: PortfolioQuoteApproval | null;
  transaction: PortfolioQuoteTransaction | null;
  /** Payment method for buy/sell quotes. Null for swap/bridge. */
  paymentMethod: string | null;
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

export interface PortfolioChainDisplay {
  id: string;
  name: string;
  logoUrl: string | null;
  numericChainId: number | null;
  /**
   * Network picker ranking score from the portfolio API.
   * Higher is better for default chain filter sort order.
   */
  rankScore: number;
}

export type PortfolioChainDisplayRecord = Record<string, PortfolioChainDisplay>;

export interface PortfolioAssetsResponse {
  assets: PortfolioCanonicalAsset[];
  chains: PortfolioChainDisplayRecord;
}

export interface PortfolioAvailableAssetsResponse {
  mode: PortfolioMode;
  direction: 'from' | 'to' | null;
  sourceAssetId: string | null;
  assets: PortfolioCanonicalAsset[];
  chains: PortfolioChainDisplayRecord;
}

export interface PortfolioFiatRampPaymentMethodGroup {
  id: string;
  label: string;
}

export interface PortfolioFiatRampPaymentMethod {
  id: string;
  label: string;
  group?: PortfolioFiatRampPaymentMethodGroup;
}

export interface PortfolioFiatRampOptions {
  fiatCurrencies: string[];
  paymentMethods: PortfolioFiatRampPaymentMethod[];
}

export interface PortfolioFiatRampCountry {
  countryCode: string;
  name: string | null;
}

export interface PortfolioFiatRampCountriesResponse {
  countries: PortfolioFiatRampCountry[];
}

export interface PortfolioFiatRampLocale {
  countryCode: string | null;
  source: 'header' | 'ip_lookup' | 'client_lookup' | 'unavailable';
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
  /** Quote estimate persisted at accept time. */
  toAmount: string | null;
  /** Actual destination fill from provider status; null until known. */
  receivedAmount: string | null;
  fromAddress: string | null;
  toAddress: string | null;
  redirectUrl: string | null;
  transaction: PortfolioQuoteTransaction | null;
  /** ISO fiat currency for buy/sell (`USD`, …). Null for swap/bridge. */
  fiatCurrency: string | null;
  /** Payment method for buy/sell when known. Null for swap/bridge. */
  paymentMethod: string | null;
  submittedAt: string | null;
  updatedAt: string | null;
}

export type PortfolioFailureCode =
  | 'unknown'
  | 'transaction_reverted'
  | 'slippage_exceeded'
  | 'insufficient_balance'
  | 'insufficient_allowance'
  | 'out_of_gas'
  | 'expired'
  | 'refunded'
  | 'bridge_failed'
  | 'aml_review'
  | 'amount_below_minimum'
  | 'canceled'
  | 'slippage_refund'
  | 'funds_returned'
  | 'manual_recovery_required'
  | 'exchange_failed';

export type PortfolioFailureAction =
  | 'contact_support'
  | 'retry_swap'
  | 'check_wallet_balance'
  | 'check_token_allowance'
  | 'increase_slippage'
  | 'wait_for_refund'
  | 'check_wallet'
  | 'view_explorer'
  | 'submit_recovery_transaction'
  | 'create_new_exchange';

export interface PortfolioHistoryItem extends PortfolioExecution {
  displayStatus: string;
  executionType: PortfolioExecutionType | null;
  txHash: string | null;
  providerName: string | null;
  providerLogoUrl: string | null;
  providerStatus: string | null;
  lastProviderStatusRefreshAt: string | null;
  failureCode: PortfolioFailureCode | null;
  failureAction: PortfolioFailureAction | null;
  providerStatusDetail: string | null;
  providerStatusUrl: string | null;
  supportUrl: string | null;
}

export interface PortfolioHistoryResponse {
  page: number;
  pageSize: number;
  hasMore: boolean;
  items: PortfolioHistoryItem[];
}

/** Product feature flags from `GET /features`. */
export interface PortfolioFeatureFlags {
  swapBridge: boolean;
  buy: boolean;
  sell: boolean;
}

export interface PortfolioFeaturesResponse {
  version: 1;
  features: PortfolioFeatureFlags;
}

export interface PortfolioSwapAmountRangeDetails {
  fromAssetId?: string;
  toAssetId?: string;
  requestedAmount?: string;
  fiatCurrency?: string;
  mode?: string;
  mergedRange?: {
    min?: string | null;
    max?: string | null;
  };
  providerRanges?: Array<{
    provider?: string;
    min?: string | null;
    max?: string | null;
  }>;
}

export interface PortfolioApiErrorPayload {
  code?: string;
  message?: string;
  requestId?: string;
  details?: PortfolioSwapAmountRangeDetails;
  error?: PortfolioApiErrorPayload;
}
