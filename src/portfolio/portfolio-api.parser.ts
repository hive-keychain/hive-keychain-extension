import {
  PortfolioAvailableAssetsResponse,
  PortfolioCanonicalAsset,
  PortfolioEcosystem,
  PortfolioEvmTransaction,
  PortfolioExecution,
  PortfolioExecutionType,
  PortfolioFiatRampOptions,
  PortfolioFiatRampPaymentMethod,
  PortfolioHistoryItem,
  PortfolioHistoryResponse,
  PortfolioInAppPayload,
  PortfolioMode,
  PortfolioQuote,
  PortfolioQuoteFee,
  PortfolioQuoteRequestEcho,
  PortfolioQuoteResponse,
  PortfolioRedirectOrder,
  PortfolioRouteType,
} from 'src/portfolio/portfolio-api.interface';

const portfolioModes: PortfolioMode[] = ['buy', 'sell', 'swap', 'bridge'];
const portfolioRouteTypes: PortfolioRouteType[] = ['swap', 'bridge'];
const portfolioExecutionTypes: PortfolioExecutionType[] = ['in_app', 'redirect'];
const portfolioEcosystems: PortfolioEcosystem[] = ['evm', 'hive', 'hive_engine'];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const readString = (
  record: Record<string, unknown>,
  key: string,
  fallback = '',
): string => {
  const value = record[key];
  return typeof value === 'string' ? value : fallback;
};

const readNullableString = (
  record: Record<string, unknown>,
  key: string,
): string | null => {
  const value = record[key];
  if (value === null || value === undefined) {
    return null;
  }
  return typeof value === 'string' ? value : null;
};

const readNullableNumber = (
  record: Record<string, unknown>,
  key: string,
): number | null => {
  const value = record[key];
  if (value === null || value === undefined) {
    return null;
  }
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
};

const readBoolean = (
  record: Record<string, unknown>,
  key: string,
  fallback = false,
): boolean => (typeof record[key] === 'boolean' ? record[key] : fallback);

const readStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string')
    : [];

const readEnum = <T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T =>
  typeof value === 'string' && allowed.includes(value as T)
    ? (value as T)
    : fallback;

const readRecord = (value: unknown): Record<string, unknown> | null =>
  isRecord(value) ? value : null;

const parsePortfolioQuoteFee = (value: unknown): PortfolioQuoteFee | null => {
  if (!isRecord(value)) {
    return null;
  }

  const amount = readString(value, 'amount');
  const currency = readString(value, 'currency');
  if (!amount || !currency) {
    return null;
  }

  return { amount, currency };
};

const parsePortfolioCanonicalAsset = (
  value: unknown,
): PortfolioCanonicalAsset | null => {
  if (!isRecord(value)) {
    return null;
  }

  const assetId = readString(value, 'assetId');
  if (!assetId) {
    return null;
  }

  return {
    assetId,
    ecosystem: readEnum(value.ecosystem, portfolioEcosystems, 'evm'),
    symbol: readString(value, 'symbol'),
    name: readString(value, 'name'),
    chainId: readNullableString(value, 'chainId'),
    address: readNullableString(value, 'address'),
    decimals: readNullableNumber(value, 'decimals'),
    isNative: readBoolean(value, 'isNative'),
    familyId: readString(value, 'familyId'),
    logoUrl: readNullableString(value, 'logoUrl'),
  };
};

const parsePortfolioEvmTransaction = (
  value: unknown,
): PortfolioEvmTransaction | null => {
  if (!isRecord(value)) {
    return null;
  }

  const to = readString(value, 'to');
  if (!to) {
    return null;
  }

  const chainId = readNullableNumber(value, 'chainId');
  if (chainId === null) {
    return null;
  }

  return {
    from: readNullableString(value, 'from'),
    to,
    value: readString(value, 'value', '0'),
    data: readString(value, 'data', '0x'),
    chainId,
    gasLimit: readNullableString(value, 'gasLimit'),
    gasPrice: readNullableString(value, 'gasPrice'),
    maxFeePerGas: readNullableString(value, 'maxFeePerGas'),
    maxPriorityFeePerGas: readNullableString(value, 'maxPriorityFeePerGas'),
  };
};

const parsePortfolioQuote = (value: unknown): PortfolioQuote | null => {
  if (!isRecord(value)) {
    return null;
  }

  const quoteId = readString(value, 'quoteId');
  if (!quoteId) {
    return null;
  }

  const estimatedToAmount = readString(value, 'estimatedToAmount');
  const comparableValue = readString(value, 'comparableValue', estimatedToAmount);

  return {
    quoteId,
    provider: readString(value, 'provider'),
    providerName: readString(value, 'providerName'),
    providerLogoUrl: readNullableString(value, 'providerLogoUrl'),
    category: readEnum(value.category, portfolioModes, 'swap'),
    routeType:
      value.routeType === null
        ? null
        : readEnum(value.routeType, portfolioRouteTypes, 'swap'),
    fromAsset: parsePortfolioCanonicalAsset(value.fromAsset),
    toAsset: parsePortfolioCanonicalAsset(value.toAsset),
    fromAmount: readString(value, 'fromAmount'),
    estimatedToAmount,
    comparableValue,
    providerFee: parsePortfolioQuoteFee(value.providerFee),
    networkFeeEstimate: parsePortfolioQuoteFee(value.networkFeeEstimate),
    priceImpact: readNullableString(value, 'priceImpact'),
    warnings: readStringArray(value.warnings),
    expiresAt: readNullableString(value, 'expiresAt'),
    redirectUrl: readNullableString(value, 'redirectUrl'),
    requiresRedirect: readBoolean(value, 'requiresRedirect'),
    executionType: readEnum(
      value.executionType,
      portfolioExecutionTypes,
      'redirect',
    ),
    routeMetadata: readRecord(value.routeMetadata),
    transaction: parsePortfolioEvmTransaction(value.transaction),
  };
};

const parsePortfolioQuoteRequestEcho = (
  value: unknown,
): PortfolioQuoteRequestEcho => {
  if (!isRecord(value)) {
    return {
      mode: 'swap',
      routeType: null,
      fromAssetId: null,
      toAssetId: null,
      fiatCurrency: null,
      paymentMethod: null,
      countryCode: null,
      sourceChainId: null,
      destinationChainId: null,
    };
  }

  return {
    mode: readEnum(value.mode, portfolioModes, 'swap'),
    routeType:
      value.routeType === null
        ? null
        : readEnum(value.routeType, portfolioRouteTypes, 'swap'),
    fromAssetId: readNullableString(value, 'fromAssetId'),
    toAssetId: readNullableString(value, 'toAssetId'),
    fiatCurrency: readNullableString(value, 'fiatCurrency'),
    paymentMethod: readNullableString(value, 'paymentMethod'),
    countryCode: readNullableString(value, 'countryCode'),
    sourceChainId: readNullableString(value, 'sourceChainId'),
    destinationChainId: readNullableString(value, 'destinationChainId'),
  };
};

const parsePortfolioQuoteResponse = (value: unknown): PortfolioQuoteResponse => {
  if (!isRecord(value)) {
    return {
      request: parsePortfolioQuoteRequestEcho(undefined),
      quotes: [],
    };
  }

  const quotes = Array.isArray(value.quotes)
    ? value.quotes
        .map((quote) => parsePortfolioQuote(quote))
        .filter((quote): quote is PortfolioQuote => quote !== null)
    : [];

  return {
    request: parsePortfolioQuoteRequestEcho(value.request),
    quotes,
  };
};

const parsePortfolioAssets = (value: unknown): PortfolioCanonicalAsset[] => {
  if (!isRecord(value) || !Array.isArray(value.assets)) {
    return [];
  }

  return value.assets
    .map((asset) => parsePortfolioCanonicalAsset(asset))
    .filter((asset): asset is PortfolioCanonicalAsset => asset !== null);
};

const parsePortfolioAvailableAssetsResponse = (
  value: unknown,
): PortfolioAvailableAssetsResponse => {
  if (!isRecord(value)) {
    return {
      mode: 'swap',
      direction: 'from',
      sourceAssetId: null,
      assets: [],
    };
  }

  return {
    mode: readEnum(value.mode, portfolioModes, 'swap'),
    direction: value.direction === 'to' ? 'to' : 'from',
    sourceAssetId: readNullableString(value, 'sourceAssetId'),
    assets: Array.isArray(value.assets)
      ? value.assets
          .map((asset) => parsePortfolioCanonicalAsset(asset))
          .filter((asset): asset is PortfolioCanonicalAsset => asset !== null)
      : [],
  };
};

const parsePortfolioFiatRampPaymentMethod = (
  value: unknown,
): PortfolioFiatRampPaymentMethod | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = readString(value, 'id');
  if (!id) {
    return null;
  }

  return {
    id,
    label: readString(value, 'label'),
  };
};

const parsePortfolioFiatRampOptions = (
  value: unknown,
): PortfolioFiatRampOptions => {
  if (!isRecord(value)) {
    return {
      fiatCurrencies: [],
      paymentMethods: [],
    };
  }

  return {
    fiatCurrencies: readStringArray(value.fiatCurrencies),
    paymentMethods: Array.isArray(value.paymentMethods)
      ? value.paymentMethods
          .map((method) => parsePortfolioFiatRampPaymentMethod(method))
          .filter(
            (method): method is PortfolioFiatRampPaymentMethod =>
              method !== null,
          )
      : [],
  };
};

const parsePortfolioExecution = (value: unknown): PortfolioExecution | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = readString(value, 'id');
  if (!id) {
    return null;
  }

  return {
    id,
    status: readString(value, 'status'),
    mode: readString(value, 'mode'),
    provider: readString(value, 'provider'),
    providerReferenceId: readNullableString(value, 'providerReferenceId'),
    fromAssetId: readNullableString(value, 'fromAssetId'),
    toAssetId: readNullableString(value, 'toAssetId'),
    fromAmount: readNullableString(value, 'fromAmount'),
    toAmount: readNullableString(value, 'toAmount'),
    fromAddress: readNullableString(value, 'fromAddress'),
    toAddress: readNullableString(value, 'toAddress'),
    submittedAt: readNullableString(value, 'submittedAt'),
    updatedAt: readNullableString(value, 'updatedAt'),
  };
};

const parsePortfolioHistoryItem = (
  value: unknown,
): PortfolioHistoryItem | null => {
  const execution = parsePortfolioExecution(value);
  if (!execution || !isRecord(value)) {
    return null;
  }

  return {
    ...execution,
    displayStatus: readString(value, 'displayStatus'),
    executionType:
      value.executionType === null
        ? null
        : readEnum(value.executionType, portfolioExecutionTypes, 'redirect'),
    txHash: readNullableString(value, 'txHash'),
  };
};

const parsePortfolioHistoryResponse = (
  value: unknown,
): PortfolioHistoryResponse => {
  if (!isRecord(value)) {
    return {
      page: 1,
      pageSize: 20,
      hasMore: false,
      items: [],
    };
  }

  return {
    page:
      typeof value.page === 'number' && Number.isFinite(value.page)
        ? value.page
        : 1,
    pageSize:
      typeof value.pageSize === 'number' && Number.isFinite(value.pageSize)
        ? value.pageSize
        : 20,
    hasMore: readBoolean(value, 'hasMore'),
    items: Array.isArray(value.items)
      ? value.items
          .map((item) => parsePortfolioHistoryItem(item))
          .filter((item): item is PortfolioHistoryItem => item !== null)
      : [],
  };
};

const parsePortfolioInAppPayload = (
  value: unknown,
): PortfolioInAppPayload | null => {
  if (!isRecord(value)) {
    return null;
  }

  const quoteId = readString(value, 'quoteId');
  const chainId = readNullableNumber(value, 'chainId');
  if (!quoteId || chainId === null || !isRecord(value.transaction)) {
    return null;
  }

  const transaction = value.transaction;

  return {
    provider: readString(value, 'provider'),
    quoteId,
    chainId,
    transaction: {
      to: readString(transaction, 'to'),
      data: readString(transaction, 'data'),
      value: readString(transaction, 'value', '0'),
      from: readNullableString(transaction, 'from') ?? undefined,
      gasLimit: readNullableString(transaction, 'gasLimit'),
      gasPrice: readNullableString(transaction, 'gasPrice'),
      maxFeePerGas: readNullableString(transaction, 'maxFeePerGas'),
      maxPriorityFeePerGas: readNullableString(
        transaction,
        'maxPriorityFeePerGas',
      ),
    },
    estimatedToAmount: readString(value, 'estimatedToAmount'),
    fromAmount: readString(value, 'fromAmount'),
  };
};

const parsePortfolioRedirectOrder = (
  value: unknown,
): PortfolioRedirectOrder | null => {
  if (!isRecord(value)) {
    return null;
  }

  const executionId = readString(value, 'executionId');
  if (!executionId) {
    return null;
  }

  const depositRecord = isRecord(value.deposit) ? value.deposit : null;
  const depositAddress = depositRecord ? readString(depositRecord, 'address') : '';

  return {
    executionId,
    provider: readString(value, 'provider'),
    providerReferenceId: readNullableString(value, 'providerReferenceId'),
    redirectUrl: readNullableString(value, 'redirectUrl'),
    deposit:
      depositRecord && depositAddress
        ? {
            address: depositAddress,
            expectedAmount: readString(depositRecord, 'expectedAmount'),
            symbol: readString(depositRecord, 'symbol'),
            network: readString(depositRecord, 'network'),
          }
        : null,
  };
};

export const PortfolioApiParser = {
  parsePortfolioAssets,
  parsePortfolioAvailableAssetsResponse,
  parsePortfolioExecution,
  parsePortfolioFiatRampOptions,
  parsePortfolioHistoryItem,
  parsePortfolioHistoryResponse,
  parsePortfolioInAppPayload,
  parsePortfolioQuoteResponse,
  parsePortfolioRedirectOrder,
};
