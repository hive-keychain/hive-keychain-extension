export type PortfolioMode = 'buy' | 'sell' | 'swap' | 'bridge';

export interface PortfolioCanonicalAsset {
  assetId: string;
  ecosystem: 'evm' | 'hive' | 'hive_engine';
  symbol: string;
  name: string;
  chainId: string | null;
  logoUrl: string | null;
}

export interface PortfolioQuote {
  quoteId: string;
  provider: string;
  category: PortfolioMode;
  routeType: 'swap' | 'bridge' | null;
  fromAsset: PortfolioCanonicalAsset | null;
  toAsset: PortfolioCanonicalAsset | null;
  fromAmount: string;
  estimatedToAmount: string;
  warnings: string[];
  redirectUrl: string | null;
  requiresRedirect: boolean;
  executionType: 'in_app' | 'redirect';
}

export interface PortfolioQuoteResponse {
  request: {
    mode: PortfolioMode;
    routeType: 'swap' | 'bridge' | null;
    fromAssetId: string | null;
    toAssetId: string | null;
    fiatCurrency: string | null;
    paymentMethod: string | null;
    countryCode: string | null;
  };
  quotes: PortfolioQuote[];
}

export interface PortfolioExecution {
  id: string;
  status: string;
  mode: string;
  provider: string;
  fromAssetId: string | null;
  toAssetId: string | null;
  fromAmount: string | null;
  toAmount: string | null;
}

export interface PortfolioHistoryItem extends PortfolioExecution {
  displayStatus: string;
  txHash: string | null;
  submittedAt: string;
}

export interface PortfolioInAppPayload {
  provider: 'lifi';
  quoteId: string;
  chainId: number;
  transaction: {
    to: string;
    data: string;
    value: string;
    from?: string;
    gasLimit?: string | null;
    gasPrice?: string | null;
    maxFeePerGas?: string | null;
    maxPriorityFeePerGas?: string | null;
  };
  estimatedToAmount: string;
  fromAmount: string;
}

export interface PortfolioRedirectOrder {
  redirectUrl: string | null;
  deposit: {
    address: string;
    expectedAmount: string;
    symbol: string;
    network: string;
  } | null;
}

export interface PortfolioSwapAmountRangeDetails {
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
