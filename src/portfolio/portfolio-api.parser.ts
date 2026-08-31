import {
  PortfolioAmountHintBlockedProvider,
  PortfolioAmountHintNextUnlock,
  PortfolioAmountHintProvider,
  PortfolioAmountMissReason,
  PortfolioAssetsResponse,
  PortfolioAvailableAssetsResponse,
  PortfolioCanonicalAsset,
  PortfolioChainDisplay,
  PortfolioChainDisplayRecord,
  PortfolioEcosystem,
  PortfolioEvmTransaction,
  PortfolioExecution,
  PortfolioExecutionType,
  PortfolioFailureAction,
  PortfolioFailureCode,
  PortfolioFiatRampCountriesResponse,
  PortfolioFiatRampCountry,
  PortfolioFiatRampLocale,
  PortfolioFiatRampOptions,
  PortfolioFiatRampPaymentMethod,
  PortfolioFiatRampPaymentMethodGroup,
  PortfolioHiveCustomJsonOperation,
  PortfolioHiveOperation,
  PortfolioHiveTransaction,
  PortfolioHiveTransferOperation,
  PortfolioHistoryItem,
  PortfolioHistoryDisplayStatus,
  PortfolioHistoryResponse,
  PortfolioFeatureFlags,
  PortfolioFeaturesResponse,
  PortfolioMode,
  PortfolioQuote,
  PortfolioQuoteAmountHints,
  PortfolioQuoteApproval,
  PortfolioQuoteFee,
  PortfolioQuoteKyc,
  PortfolioQuoteRequestEcho,
  PortfolioQuoteResponse,
  PortfolioQuoteTransaction,
  PortfolioRouteType,
  PortfolioTransactionStatus,
} from 'src/portfolio/portfolio-api.interface';

const portfolioModes: PortfolioMode[] = ['buy', 'sell', 'swap', 'bridge'];
const portfolioRouteTypes: PortfolioRouteType[] = ['swap', 'bridge'];
const portfolioExecutionTypes: PortfolioExecutionType[] = ['in_app', 'redirect'];
const portfolioQuoteKycStatuses: PortfolioQuoteKyc[] = [
  'never',
  'possible',
  'typically_required',
];
const portfolioTransactionStatuses: PortfolioTransactionStatus[] = [
  'created',
  'pending',
  'awaiting_user_action',
  'awaiting_compliance_action',
  'submitted',
  'completed',
  'failed',
  'expired',
  'unknown',
];
const portfolioHistoryDisplayStatuses: PortfolioHistoryDisplayStatus[] = [
  'created',
  'pending',
  'awaiting_action',
  'verification_required',
  'submitted',
  'completed',
  'failed',
  'expired',
  'unknown',
];
const portfolioFailureCodes: PortfolioFailureCode[] = [
  'unknown',
  'transaction_reverted',
  'slippage_exceeded',
  'insufficient_balance',
  'insufficient_allowance',
  'out_of_gas',
  'expired',
  'refunded',
  'bridge_failed',
  'aml_review',
  'amount_below_minimum',
  'canceled',
  'slippage_refund',
  'funds_returned',
  'manual_recovery_required',
  'exchange_failed',
];
const portfolioFailureActions: PortfolioFailureAction[] = [
  'contact_support',
  'retry_swap',
  'check_wallet_balance',
  'check_token_allowance',
  'increase_slippage',
  'wait_for_refund',
  'check_wallet',
  'view_explorer',
  'submit_recovery_transaction',
  'create_new_exchange',
];
const portfolioAmountMissReasons: PortfolioAmountMissReason[] = [
  'below_min',
  'above_max',
];
const portfolioAmountHintDirections = ['increase', 'decrease'] as const;
const portfolioEcosystems: PortfolioEcosystem[] = [
  'evm',
  'hive',
  'hive_engine',
  'utxo',
  'svm',
  'mvm',
  'tvm',
  'external',
];

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

const readPaymentMethodId = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || null;
  }

  if (!isRecord(value)) {
    return null;
  }

  const id = readString(value, 'id').trim();
  return id || null;
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
): boolean => {
  const value = record[key];
  return typeof value === 'boolean' ? value : fallback;
};

const readStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string')
    : [];

const readNullableEnum = <T extends string>(
  value: unknown,
  allowed: readonly T[],
): T | null =>
  typeof value === 'string' && allowed.includes(value as T) ? (value as T) : null;

const readEnum = <T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T => readNullableEnum(value, allowed) ?? fallback;

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

const parsePortfolioQuoteApproval = (
  value: unknown,
): PortfolioQuoteApproval | null => {
  if (!isRecord(value)) {
    return null;
  }

  const spender = readString(value, 'spender');
  const amount = readString(value, 'amount');
  if (!spender || !amount) {
    return null;
  }

  return { spender, amount };
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
    symbol: readString(value, 'symbol').toUpperCase(),
    name: readString(value, 'name'),
    chainId: readNullableString(value, 'chainId'),
    address: readNullableString(value, 'address'),
    decimals: readNullableNumber(value, 'decimals'),
    isNative: readBoolean(value, 'isNative'),
    familyId: readString(value, 'familyId'),
    logoUrl: readNullableString(value, 'logoUrl'),
    priceUsd: readNullableNumber(value, 'priceUsd') ?? 0,
    rankScore: readNullableNumber(value, 'rankScore') ?? 0,
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

const parsePortfolioHiveTransferOperation = (
  value: unknown,
): PortfolioHiveTransferOperation | null => {
  if (!Array.isArray(value) || value[0] !== 'transfer' || !isRecord(value[1])) {
    return null;
  }

  const payload = value[1];
  const from = readString(payload, 'from');
  const to = readString(payload, 'to');
  const amount = readString(payload, 'amount');
  if (!from || !to || !amount) {
    return null;
  }

  return [
    'transfer',
    {
      from,
      to,
      amount,
      memo: readString(payload, 'memo'),
    },
  ];
};

const parsePortfolioHiveCustomJsonOperation = (
  value: unknown,
): PortfolioHiveCustomJsonOperation | null => {
  if (!Array.isArray(value) || value[0] !== 'custom_json' || !isRecord(value[1])) {
    return null;
  }

  const payload = value[1];
  const id = readString(payload, 'id');
  if (!id) {
    return null;
  }

  return [
    'custom_json',
    {
      id,
      json: readString(payload, 'json'),
      required_auths: readStringArray(payload.required_auths),
      required_posting_auths: readStringArray(payload.required_posting_auths),
    },
  ];
};

const parsePortfolioHiveOperation = (
  value: unknown,
): PortfolioHiveOperation | null =>
  parsePortfolioHiveTransferOperation(value) ??
  parsePortfolioHiveCustomJsonOperation(value);

const parsePortfolioHiveTransaction = (
  value: unknown,
): PortfolioHiveTransaction | null => {
  if (!isRecord(value) || value.method !== 'active' || !Array.isArray(value.operations)) {
    return null;
  }

  const operations = value.operations
    .map((operation) => parsePortfolioHiveOperation(operation))
    .filter((operation): operation is PortfolioHiveOperation => operation !== null);

  if (operations.length === 0) {
    return null;
  }

  const refBlockNum = readNullableNumber(value, 'ref_block_num');
  const refBlockPrefix = readNullableNumber(value, 'ref_block_prefix');
  if (refBlockNum === null || refBlockPrefix === null) {
    return null;
  }

  const expiration = readString(value, 'expiration');
  if (!expiration) {
    return null;
  }

  return {
    method: 'active',
    operations,
    expiration,
    ref_block_num: refBlockNum,
    ref_block_prefix: refBlockPrefix,
    extensions: Array.isArray(value.extensions) ? value.extensions : [],
  };
};

const parsePortfolioQuoteTransaction = (
  value: unknown,
): PortfolioQuoteTransaction | null => {
  if (!isRecord(value)) {
    return null;
  }

  if ('operations' in value) {
    return parsePortfolioHiveTransaction(value);
  }

  return parsePortfolioEvmTransaction(value);
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
  const provider = readRecord(value.provider);

  return {
    quoteId,
    provider: provider ? readString(provider, 'id') : '',
    providerName: provider ? readString(provider, 'name') : '',
    providerLogoUrl: provider ? readNullableString(provider, 'logo') : null,
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
    providerFee: provider ? parsePortfolioQuoteFee(provider.fee) : null,
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
    approval: parsePortfolioQuoteApproval(value.approval),
    transaction: parsePortfolioQuoteTransaction(value.transaction),
    paymentMethod: readPaymentMethodId(value.paymentMethod),
    kyc:
      (provider
        ? readNullableEnum(provider.kyc, portfolioQuoteKycStatuses)
        : null) ??
      readEnum(value.kyc, portfolioQuoteKycStatuses, 'never'),
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

const parsePortfolioAmountHintProvider = (
  value: unknown,
): PortfolioAmountHintProvider | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = readString(value, 'id').trim();
  if (!id) {
    return null;
  }

  return {
    id,
    name: readNullableString(value, 'name'),
    logo: readNullableString(value, 'logo'),
  };
};

const parsePortfolioAmountHintBlockedProvider = (
  value: unknown,
): PortfolioAmountHintBlockedProvider | null => {
  if (!isRecord(value)) {
    return null;
  }

  const provider = parsePortfolioAmountHintProvider(value.provider);
  const suggestedAmount = readString(value, 'suggestedAmount').trim();
  const reason = readNullableEnum(value.reason, portfolioAmountMissReasons);
  if (!provider || !suggestedAmount || !reason) {
    return null;
  }

  return {
    provider,
    reason,
    min: readNullableString(value, 'min'),
    max: readNullableString(value, 'max'),
    suggestedAmount,
    paymentMethod: readPaymentMethodId(value.paymentMethod),
  };
};

const parsePortfolioAmountHintNextUnlock = (
  value: unknown,
): PortfolioAmountHintNextUnlock | null => {
  if (!isRecord(value)) {
    return null;
  }

  const amount = readString(value, 'amount').trim();
  const direction = readNullableEnum(
    value.direction,
    portfolioAmountHintDirections,
  );
  if (!amount || !direction) {
    return null;
  }

  return {
    amount,
    direction,
    additionalProviderCount: readNullableNumber(
      value,
      'additionalProviderCount',
    ) ?? 0,
    providers: readStringArray(value.providers),
  };
};

const parsePortfolioQuoteAmountHints = (
  value: unknown,
): PortfolioQuoteAmountHints | null => {
  if (!isRecord(value) || !Array.isArray(value.blocked)) {
    return null;
  }

  const blocked = value.blocked
    .map((entry) => parsePortfolioAmountHintBlockedProvider(entry))
    .filter(
      (entry): entry is PortfolioAmountHintBlockedProvider => entry !== null,
    );

  if (blocked.length === 0) {
    return null;
  }

  return {
    requestedAmount: readString(value, 'requestedAmount'),
    blocked,
    nextUnlock: parsePortfolioAmountHintNextUnlock(value.nextUnlock),
  };
};

const parsePortfolioQuoteResponse = (value: unknown): PortfolioQuoteResponse => {
  if (!isRecord(value)) {
    return {
      request: parsePortfolioQuoteRequestEcho(undefined),
      quotes: [],
      amountHints: null,
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
    amountHints: parsePortfolioQuoteAmountHints(value.amountHints),
  };
};

const parsePortfolioChainDisplay = (
  value: unknown,
): PortfolioChainDisplay | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = readString(value, 'id');
  if (!id) {
    return null;
  }

  return {
    id,
    name: readString(value, 'name'),
    logoUrl: readNullableString(value, 'logoUrl'),
    numericChainId: readNullableNumber(value, 'numericChainId'),
    rankScore: readNullableNumber(value, 'rankScore') ?? 0,
  };
};

const parsePortfolioChainDisplayRecord = (
  value: unknown,
): PortfolioChainDisplayRecord => {
  if (!isRecord(value)) {
    return {};
  }

  return Object.entries(value).reduce<PortfolioChainDisplayRecord>(
    (chains, [key, entry]) => {
      const chain = parsePortfolioChainDisplay(entry);
      if (chain) {
        chains[key] = chain;
      }
      return chains;
    },
    {},
  );
};

const parsePortfolioAssetsResponse = (value: unknown): PortfolioAssetsResponse => {
  if (!isRecord(value) || !Array.isArray(value.assets)) {
    return {
      assets: [],
      chains: {},
    };
  }

  return {
    assets: value.assets
      .map((asset) => parsePortfolioCanonicalAsset(asset))
      .filter((asset): asset is PortfolioCanonicalAsset => asset !== null),
    chains: parsePortfolioChainDisplayRecord(value.chains),
  };
};

const parsePortfolioAvailableAssetsResponse = (
  value: unknown,
): PortfolioAvailableAssetsResponse => {
  if (!isRecord(value)) {
    return {
      mode: 'swap',
      direction: null,
      sourceAssetId: null,
      assets: [],
      chains: {},
    };
  }

  const directionValue = value.direction;
  const direction =
    directionValue === 'to'
      ? 'to'
      : directionValue === 'from'
        ? 'from'
        : null;

  return {
    mode: readEnum(value.mode, portfolioModes, 'swap'),
    direction,
    sourceAssetId: readNullableString(value, 'sourceAssetId'),
    assets: Array.isArray(value.assets)
      ? value.assets
          .map((asset) => parsePortfolioCanonicalAsset(asset))
          .filter((asset): asset is PortfolioCanonicalAsset => asset !== null)
      : [],
    chains: parsePortfolioChainDisplayRecord(value.chains),
  };
};

const parsePortfolioFiatRampPaymentMethodGroup = (
  value: unknown,
): PortfolioFiatRampPaymentMethodGroup | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }

  const id = readString(value, 'id');
  if (!id) {
    return undefined;
  }

  return {
    id,
    label: readString(value, 'label') || id,
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

  const group = parsePortfolioFiatRampPaymentMethodGroup(value.group);

  return {
    id,
    label: readString(value, 'label'),
    ...(group ? { group } : {}),
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

const parsePortfolioFiatRampCountry = (
  value: unknown,
): PortfolioFiatRampCountry | null => {
  if (!isRecord(value)) {
    return null;
  }

  const countryCode = readString(value, 'countryCode').trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(countryCode)) {
    return null;
  }

  return {
    countryCode,
    name: readNullableString(value, 'name'),
  };
};

const parsePortfolioFiatRampCountriesResponse = (
  value: unknown,
): PortfolioFiatRampCountriesResponse => {
  if (!isRecord(value) || !Array.isArray(value.countries)) {
    return { countries: [] };
  }

  return {
    countries: value.countries
      .map((country) => parsePortfolioFiatRampCountry(country))
      .filter(
        (country): country is PortfolioFiatRampCountry => country !== null,
      ),
  };
};

const parsePortfolioFiatRampLocale = (
  value: unknown,
): PortfolioFiatRampLocale => {
  if (!isRecord(value)) {
    return { countryCode: null, source: 'unavailable' };
  }

  const rawCountry = readNullableString(value, 'countryCode');
  const countryCode =
    rawCountry && /^[A-Za-z]{2}$/.test(rawCountry.trim())
      ? rawCountry.trim().toUpperCase()
      : null;

  const rawSource = readString(value, 'source').trim().toLowerCase();
  const source =
    rawSource === 'header' ||
    rawSource === 'ip_lookup' ||
    rawSource === 'client_lookup'
      ? rawSource
      : 'unavailable';

  return { countryCode, source };
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
    status: readEnum(value.status, portfolioTransactionStatuses, 'unknown'),
    mode: readString(value, 'mode'),
    provider: readString(value, 'provider'),
    providerReferenceId: readNullableString(value, 'providerReferenceId'),
    fromAssetId: readNullableString(value, 'fromAssetId'),
    toAssetId: readNullableString(value, 'toAssetId'),
    fromAmount: readNullableString(value, 'fromAmount'),
    toAmount: readNullableString(value, 'toAmount'),
    receivedAmount: readNullableString(value, 'receivedAmount'),
    fromAddress: readNullableString(value, 'fromAddress'),
    toAddress: readNullableString(value, 'toAddress'),
    redirectUrl: readNullableString(value, 'redirectUrl'),
    transaction: parsePortfolioQuoteTransaction(value.transaction),
    fiatCurrency: readNullableString(value, 'fiatCurrency'),
    paymentMethod: readNullableString(value, 'paymentMethod'),
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

  const provider = readRecord(value.provider);

  return {
    ...execution,
    provider: provider ? readString(provider, 'id') : execution.provider,
    displayStatus: readEnum(
      value.displayStatus,
      portfolioHistoryDisplayStatuses,
      'unknown',
    ),
    executionType:
      value.executionType === null
        ? null
        : readEnum(value.executionType, portfolioExecutionTypes, 'redirect'),
    txHash: readNullableString(value, 'txHash'),
    providerName: provider ? readNullableString(provider, 'name') : null,
    providerLogoUrl: provider ? readNullableString(provider, 'logo') : null,
    providerStatus: readNullableString(value, 'providerStatus'),
    lastProviderStatusRefreshAt: readNullableString(
      value,
      'lastProviderStatusRefreshAt',
    ),
    failureCode: readNullableEnum(value.failureCode, portfolioFailureCodes),
    failureAction: readNullableEnum(value.failureAction, portfolioFailureActions),
    providerStatusDetail: readNullableString(value, 'providerStatusDetail'),
    providerStatusUrl: readNullableString(value, 'providerStatusUrl'),
    supportUrl: readNullableString(value, 'supportUrl'),
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

const DEFAULT_PORTFOLIO_FEATURE_FLAGS: PortfolioFeatureFlags = {
  swapBridge: true,
  buy: true,
  sell: true,
};

const parsePortfolioFeaturesResponse = (
  value: unknown,
): PortfolioFeaturesResponse => {
  if (!isRecord(value) || !isRecord(value.features)) {
    return {
      version: 1,
      features: { ...DEFAULT_PORTFOLIO_FEATURE_FLAGS },
    };
  }

  const features = value.features;
  return {
    version: 1,
    features: {
      swapBridge: readBoolean(features, 'swapBridge', true),
      buy: readBoolean(features, 'buy', true),
      sell: readBoolean(features, 'sell', true),
    },
  };
};

export const PortfolioApiParser = {
  parsePortfolioAssetsResponse,
  parsePortfolioAvailableAssetsResponse,
  parsePortfolioExecution,
  parsePortfolioFeaturesResponse,
  parsePortfolioFiatRampCountriesResponse,
  parsePortfolioFiatRampLocale,
  parsePortfolioFiatRampOptions,
  parsePortfolioHistoryItem,
  parsePortfolioHistoryResponse,
  parsePortfolioQuoteAmountHints,
  parsePortfolioQuoteResponse,
};
