import { evmChainIdToDecimalPathSegment } from '@popup/evm/utils/evm-light-node.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import Decimal from 'decimal.js';
import { SVGIcons } from 'src/common-ui/icons.enum';
import {
  PortfolioCanonicalAsset,
  PortfolioChainDisplay,
  PortfolioChainDisplayRecord,
  PortfolioDestinationOnlyEcosystem,
  PortfolioEcosystem,
  PortfolioMode,
} from 'src/portfolio/portfolio-api.interface';
import { EvmAddressUtils } from 'src/utils/evm/evm-address.utils';

const HIVE_CORE_SYMBOLS = new Set(['HIVE', 'HBD', 'HP']);
const HIVE_KEYCHAIN_SWAP_TARGET_SYMBOLS = new Set(['HIVE', 'HBD']);
const HIVE_EXTERNAL_BRIDGE_TARGET_SYMBOLS = new Set(['HIVE']);
const HIVE_SWAP_EXCLUDED_SYMBOLS = new Set(['HP']);
const FIAT_QUOTE_AMOUNT_DECIMALS = 2;
const EVM_NATIVE_TOKEN_DECIMALS = 18;
const HIVE_CORE_TOKEN_DECIMALS = 3;
const DEFAULT_HIVE_ENGINE_TOKEN_DECIMALS = 8;
const FALLBACK_TOKEN_DECIMALS = 18;

export type PortfolioFlowRow = {
  key: string;
  symbol: string;
  network: string;
  balance: string;
  decimals?: number;
  chainId?: string | null;
  isTestnet?: boolean;
  logoUrl?: string | null;
  networkLogoUrl?: string | null;
  isHive?: boolean;
};

export type PortfolioFlowSelectOption = {
  value: string;
  label: string;
};

export const getHiveTokenIcon = (symbol: string): SVGIcons | undefined => {
  switch (symbol.toUpperCase()) {
    case 'HBD':
      return SVGIcons.WALLET_HBD_LOGO;
    case 'HIVE':
      return SVGIcons.WALLET_HIVE_LOGO;
    case 'HP':
      return SVGIcons.WALLET_HP_LOGO;
    default:
      return undefined;
  }
};

export const hasPositivePortfolioBalance = (balance: string): boolean => {
  const amount = Number(balance.replace(/,/g, ''));
  return Number.isFinite(amount) && amount > 0;
};

export const formatPortfolioTokenBalance = (balance: string): string => {
  const amount = Number(balance.replace(/,/g, ''));
  return Number.isFinite(amount)
    ? amount.toLocaleString(undefined, { maximumFractionDigits: 8 })
    : balance;
};

export const resolveHiveTokenDecimals = (
  symbol: string,
  tokens: ReadonlyArray<{ symbol: string; precision: number }> = [],
): number => {
  if (HIVE_CORE_SYMBOLS.has(symbol.toUpperCase())) {
    return HIVE_CORE_TOKEN_DECIMALS;
  }

  const token = tokens.find(
    (item) => item.symbol.toUpperCase() === symbol.toUpperCase(),
  );
  return token?.precision ?? DEFAULT_HIVE_ENGINE_TOKEN_DECIMALS;
};

export const formatPortfolioQuoteFromAmount = (
  amount: string,
  decimals: number,
): string => {
  const normalizedAmount = amount.replace(/,/g, '').trim();
  if (!normalizedAmount) {
    return normalizedAmount;
  }

  try {
    const decimalAmount = new Decimal(normalizedAmount);
    if (!decimalAmount.isFinite() || decimalAmount.isNegative()) {
      return normalizedAmount;
    }

    return decimalAmount
      .toDecimalPlaces(decimals, Decimal.ROUND_DOWN)
      .toFixed()
      .replace(/(\.\d*?)0+$/, '$1')
      .replace(/\.$/, '');
  } catch {
    return normalizedAmount;
  }
};

export const resolvePortfolioQuoteFromAmountDecimals = (options: {
  mode: PortfolioMode;
  fromAssetId: string;
  rows: PortfolioFlowRow[];
  assets: PortfolioCanonicalAsset[];
  chains?: EvmChain[];
}): number => {
  if (options.mode === 'buy') {
    return FIAT_QUOTE_AMOUNT_DECIMALS;
  }

  const row = options.rows.find((item) => item.key === options.fromAssetId);
  if (row?.decimals !== undefined) {
    return row.decimals;
  }

  const asset =
    options.assets.find((item) => item.assetId === options.fromAssetId) ??
    (row
      ? resolvePortfolioRowToCanonicalAsset(
          row,
          options.assets,
          options.chains ?? [],
        )
      : undefined);

  if (!asset) {
    return FALLBACK_TOKEN_DECIMALS;
  }

  if (asset.ecosystem === 'hive') {
    return HIVE_CORE_TOKEN_DECIMALS;
  }

  if (asset.ecosystem === 'hive_engine') {
    return DEFAULT_HIVE_ENGINE_TOKEN_DECIMALS;
  }

  return getContractAddressFromAssetId(asset.assetId)
    ? FALLBACK_TOKEN_DECIMALS
    : EVM_NATIVE_TOKEN_DECIMALS;
};

const normalizeChainId = (chainId: string | null | undefined): string | null => {
  if (!chainId) {
    return null;
  }

  const trimmed = chainId.trim();
  if (!trimmed) {
    return null;
  }

  return evmChainIdToDecimalPathSegment(trimmed);
};

const chainIdsMatch = (
  left: string | null | undefined,
  right: string | null | undefined,
): boolean => {
  const normalizedLeft = normalizeChainId(left);
  const normalizedRight = normalizeChainId(right);
  if (!normalizedLeft || !normalizedRight) {
    return false;
  }

  return normalizedLeft === normalizedRight;
};

const EVM_CONTRACT_ADDRESS_PATTERN = /^0x[0-9a-f]{40}$/i;

type ParsedPortfolioEvmRowKey = {
  chainReference: string;
  contractAddress: string | null;
};

const parsePortfolioEvmRowKey = (
  row: PortfolioFlowRow,
): ParsedPortfolioEvmRowKey | null => {
  if (row.key.startsWith('hive:')) {
    return null;
  }

  const parts = row.key.split(':');
  if (parts.length < 3) {
    return null;
  }

  const chainReference = row.chainId ?? parts[0];
  const tail = parts[parts.length - 1]?.toLowerCase() ?? '';
  const contractAddress =
    tail === 'native'
      ? null
      : EVM_CONTRACT_ADDRESS_PATTERN.test(tail)
        ? tail
        : null;

  return {
    chainReference,
    contractAddress,
  };
};

const getContractAddressFromAssetId = (
  assetId: string,
): string | null => {
  const tail = assetId.split(':').pop()?.toLowerCase() ?? '';
  return EVM_CONTRACT_ADDRESS_PATTERN.test(tail) ? tail : null;
};

const getChainSlugFromAssetId = (assetId: string): string | null => {
  const parts = assetId.split(':');
  if (parts[0] !== 'evm') {
    return null;
  }

  const slug = parts[2]?.trim().toLowerCase() ?? '';
  if (
    !slug ||
    EVM_CONTRACT_ADDRESS_PATTERN.test(slug) ||
    /^\d+$/.test(slug)
  ) {
    return null;
  }

  if (parts[1] === 'native' && parts.length === 3) {
    return slug;
  }

  if (parts.length < 4) {
    return null;
  }

  return slug;
};

const getChainReferencesFromAsset = (
  asset: PortfolioCanonicalAsset,
): string[] => {
  const references = new Set<string>();

  if (asset.chainId) {
    references.add(asset.chainId);
  }

  const chainSlug = getChainSlugFromAssetId(asset.assetId);
  if (chainSlug) {
    references.add(chainSlug);
  }

  const parts = asset.assetId.split(':');
  if (parts[0] !== 'evm') {
    return [...references];
  }

  for (const part of parts.slice(1)) {
    if (/^\d+$/.test(part)) {
      references.add(part);
      references.add(`0x${BigInt(part).toString(16)}`);
    }
  }

  return [...references];
};

const resolveAssetEvmChain = (
  asset: PortfolioCanonicalAsset,
  chains: EvmChain[],
): EvmChain | undefined => {
  for (const chainReference of getChainReferencesFromAsset(asset)) {
    const chain = resolveEvmChainForChainReference(chainReference, chains);
    if (chain) {
      return chain;
    }
  }

  return undefined;
};

const resolveChainNumericId = (
  chainReference: string | null | undefined,
  chains: EvmChain[] = [],
  portfolioChains: PortfolioChainDisplayRecord = {},
): string | null => {
  if (!chainReference) {
    return null;
  }

  const resolvedChain = resolveEvmChainForChainReference(chainReference, chains);
  if (resolvedChain?.chainId) {
    const normalizedChainId = normalizeChainId(resolvedChain.chainId);
    if (normalizedChainId) {
      return normalizedChainId;
    }
  }

  const portfolioChain =
    resolvePortfolioChainDisplay(chainReference, portfolioChains) ??
    Object.values(portfolioChains).find(
      (chain) =>
        chain.numericChainId !== null &&
        chainIdsMatch(String(chain.numericChainId), chainReference),
    );
  if (portfolioChain?.numericChainId != null) {
    return String(portfolioChain.numericChainId);
  }

  return normalizeChainId(chainReference);
};

const assetChainMatchesRow = (
  asset: PortfolioCanonicalAsset,
  rowChainReference: string,
  chains: EvmChain[],
  portfolioChains: PortfolioChainDisplayRecord = {},
): boolean => {
  const rowNumericChainId = resolveChainNumericId(
    rowChainReference,
    chains,
    portfolioChains,
  );
  if (rowNumericChainId) {
    const assetMatchesNumericChainId = getChainReferencesFromAsset(asset).some(
      (chainReference) =>
        resolveChainNumericId(chainReference, chains, portfolioChains) ===
        rowNumericChainId,
    );
    if (assetMatchesNumericChainId) {
      return true;
    }
  }

  const rowChain = resolveEvmChainForChainReference(rowChainReference, chains);
  const assetChain = resolveAssetEvmChain(asset, chains);

  if (rowChain && assetChain) {
    return chainIdsMatch(rowChain.chainId, assetChain.chainId);
  }

  return getChainReferencesFromAsset(asset).some((chainReference) =>
    chainIdsMatch(chainReference, rowChainReference),
  );
};

const isNativeCanonicalAsset = (asset: PortfolioCanonicalAsset): boolean => {
  if (asset.isNative) {
    return true;
  }

  const parts = asset.assetId.split(':');
  return parts[0] === 'evm' && parts[1] === 'native';
};

export const portfolioRowMatchesCanonicalAsset = (
  row: PortfolioFlowRow,
  asset: PortfolioCanonicalAsset,
  chains: EvmChain[] = [],
  portfolioChains: PortfolioChainDisplayRecord = {},
): boolean => {
  const parsedRow = parsePortfolioEvmRowKey(row);
  if (!parsedRow || asset.ecosystem !== 'evm') {
    return false;
  }

  const normalizedSymbol = row.symbol.toUpperCase();
  if (asset.symbol.toUpperCase() !== normalizedSymbol) {
    return false;
  }

  if (parsedRow.contractAddress) {
    const assetContractAddress = getContractAddressFromAssetId(asset.assetId);
    if (assetContractAddress !== parsedRow.contractAddress) {
      return false;
    }

    return assetChainMatchesRow(
      asset,
      parsedRow.chainReference,
      chains,
      portfolioChains,
    );
  }

  if (!isNativeCanonicalAsset(asset)) {
    return false;
  }

  if (getContractAddressFromAssetId(asset.assetId)) {
    return false;
  }

  return assetChainMatchesRow(
    asset,
    parsedRow.chainReference,
    chains,
    portfolioChains,
  );
};

export const resolvePortfolioRowToSwapFromAssetId = (
  row: PortfolioFlowRow,
  swapFromAssets: PortfolioCanonicalAsset[],
  chains: EvmChain[] = [],
  portfolioChains: PortfolioChainDisplayRecord = {},
): string | undefined =>
  swapFromAssets.find((asset) =>
    portfolioRowMatchesCanonicalAsset(row, asset, chains, portfolioChains),
  )?.assetId;

const resolveEvmPortfolioRowToCanonicalAsset = (
  row: PortfolioFlowRow,
  assets: PortfolioCanonicalAsset[],
  chains: EvmChain[],
  portfolioChains: PortfolioChainDisplayRecord = {},
): PortfolioCanonicalAsset | undefined => {
  const parsedRow = parsePortfolioEvmRowKey(row);
  if (!parsedRow) {
    return undefined;
  }

  const normalizedSymbol = row.symbol.toUpperCase();

  if (parsedRow.contractAddress) {
    return assets.find((asset) => {
      if (asset.ecosystem !== 'evm') {
        return false;
      }

      const assetContractAddress = getContractAddressFromAssetId(asset.assetId);
      if (assetContractAddress !== parsedRow.contractAddress) {
        return false;
      }

      return assetChainMatchesRow(
        asset,
        parsedRow.chainReference,
        chains,
        portfolioChains,
      );
    });
  }

  return assets.find((asset) => {
    if (asset.ecosystem !== 'evm') {
      return false;
    }

    if (!isNativeCanonicalAsset(asset)) {
      return false;
    }

    if (getContractAddressFromAssetId(asset.assetId)) {
      return false;
    }

    if (asset.symbol.toUpperCase() !== normalizedSymbol) {
      return false;
    }

    return assetChainMatchesRow(
      asset,
      parsedRow.chainReference,
      chains,
      portfolioChains,
    );
  });
};

export const getHivePortfolioRowEcosystem = (
  symbol: string,
): 'hive' | 'hive_engine' =>
  HIVE_CORE_SYMBOLS.has(symbol.toUpperCase()) ? 'hive' : 'hive_engine';

export const resolveHivePortfolioRowNetworkLogoUrl = (
  symbol: string,
): string =>
  getHivePortfolioRowEcosystem(symbol) === 'hive'
    ? HIVE_CHAIN_LOGO
    : HIVE_ENGINE_CHAIN_LOGO;

const normalizeChainReference = (
  value: string | null | undefined,
): string | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed.toLowerCase() : null;
};

const resolvePortfolioChainDisplay = (
  chainId: string | null | undefined,
  portfolioChains: PortfolioChainDisplayRecord = {},
): PortfolioChainDisplay | undefined => {
  if (!chainId) {
    return undefined;
  }

  const directMatch =
    portfolioChains[chainId] ?? portfolioChains[chainId.toLowerCase()];
  if (directMatch) {
    return directMatch;
  }

  const normalizedChainId = normalizeChainReference(chainId);
  if (!normalizedChainId) {
    return undefined;
  }

  return Object.values(portfolioChains).find(
    (chain) => chain.id.toLowerCase() === normalizedChainId,
  );
};

export const resolveEvmChainForChainReference = (
  chainReference: string | null | undefined,
  chains: EvmChain[],
): EvmChain | undefined => {
  if (!chainReference) {
    return undefined;
  }

  const chainById = chains.find((chain) =>
    chainIdsMatch(chain.chainId, chainReference),
  );
  if (chainById) {
    return chainById;
  }

  const normalizedReference = normalizeChainReference(chainReference);
  if (!normalizedReference) {
    return undefined;
  }

  return chains.find((chain) => {
    const references = [chain.name, chain.network, chain.openSeaChainId];

    return references.some(
      (reference) => normalizeChainReference(reference) === normalizedReference,
    );
  });
};

export const resolveEvmChainLogoUrl = (
  chainId: string | null | undefined,
  chains: EvmChain[],
): string | null =>
  resolveEvmChainForChainReference(chainId, chains)?.logo ?? null;

export const resolvePortfolioRowToCanonicalAsset = (
  row: PortfolioFlowRow,
  assets: PortfolioCanonicalAsset[],
  chains: EvmChain[] = [],
  portfolioChains: PortfolioChainDisplayRecord = {},
): PortfolioCanonicalAsset | undefined => {
  const parsedEvmRow = parsePortfolioEvmRowKey(row);
  if (parsedEvmRow) {
    return resolveEvmPortfolioRowToCanonicalAsset(
      row,
      assets,
      chains,
      portfolioChains,
    );
  }

  const normalizedSymbol = row.symbol.toUpperCase();
  const ecosystem = getHivePortfolioRowEcosystem(row.symbol);
  return assets.find(
    (asset) =>
      asset.ecosystem === ecosystem &&
      asset.symbol.toUpperCase() === normalizedSymbol,
  );
};

export const resolvePortfolioRowToCanonicalAssetId = (
  row: PortfolioFlowRow,
  assets: PortfolioCanonicalAsset[],
  chains: EvmChain[] = [],
  portfolioChains: PortfolioChainDisplayRecord = {},
): string | undefined =>
  resolvePortfolioRowToCanonicalAsset(row, assets, chains, portfolioChains)
    ?.assetId;

export const isPortfolioSwapExcludedSymbol = (symbol: string): boolean =>
  HIVE_SWAP_EXCLUDED_SYMBOLS.has(symbol.toUpperCase());

export const isPortfolioSwapExcludedAsset = (
  asset: PortfolioCanonicalAsset,
): boolean =>
  asset.ecosystem === 'hive' &&
  isPortfolioSwapExcludedSymbol(asset.symbol);

export const buildPortfolioFromSelectOptions = (
  rows: PortfolioFlowRow[],
): PortfolioFlowSelectOption[] =>
  rows
    .filter((row) => hasPositivePortfolioBalance(row.balance))
    .filter((row) => !row.isTestnet)
    .filter((row) => !isPortfolioSwapExcludedSymbol(row.symbol))
    .map((row) => {
      const formattedBalance = formatPortfolioTokenBalance(row.balance);
      return {
        value: row.key,
        label: row.network
          ? `${row.symbol} - ${row.network} (${formattedBalance})`
          : `${row.symbol} (${formattedBalance})`,
      };
    });

export const resolveCanonicalAssetNetworkLabel = (
  asset: PortfolioCanonicalAsset,
  chains: EvmChain[] = [],
  portfolioChains: PortfolioChainDisplayRecord = {},
): string => {
  if (asset.ecosystem === 'hive') {
    return 'Hive';
  }

  if (asset.ecosystem === 'hive_engine') {
    return 'Hive Engine';
  }

  const portfolioChain = resolvePortfolioChainDisplay(
    asset.chainId,
    portfolioChains,
  );
  if (portfolioChain?.name) {
    return portfolioChain.name;
  }

  if (isDestinationOnlyPortfolioEcosystem(asset.ecosystem)) {
    if (asset.chainId) {
      return asset.chainId.charAt(0).toUpperCase() + asset.chainId.slice(1);
    }

    return asset.name || asset.symbol;
  }

  const chain = resolveEvmChainForChainReference(asset.chainId, chains);
  if (chain) {
    return chain.name;
  }

  return asset.chainId ?? '';
};

export const resolveCanonicalAssetNetworkLogoUrl = (
  asset: PortfolioCanonicalAsset,
  chains: EvmChain[] = [],
  portfolioChains: PortfolioChainDisplayRecord = {},
): string | null => {
  if (asset.ecosystem === 'hive') {
    return HIVE_CHAIN_LOGO;
  }

  if (asset.ecosystem === 'hive_engine') {
    return HIVE_ENGINE_CHAIN_LOGO;
  }

  const portfolioChain = resolvePortfolioChainDisplay(
    asset.chainId,
    portfolioChains,
  );
  if (portfolioChain?.logoUrl) {
    return portfolioChain.logoUrl;
  }

  return resolveEvmChainForChainReference(asset.chainId, chains)?.logo ?? null;
};

export const buildCanonicalAssetSelectOptions = (
  assets: PortfolioCanonicalAsset[],
  chains: EvmChain[] = [],
  portfolioChains: PortfolioChainDisplayRecord = {},
): PortfolioFlowSelectOption[] =>
  assets.map((asset) => ({
    value: asset.assetId,
    label: `${asset.symbol} - ${resolveCanonicalAssetNetworkLabel(asset, chains, portfolioChains)}`,
  }));

export type PortfolioAssetChainFilterOption = {
  value: string;
  label: string;
  key: string;
  img?: string;
  imgChip?: SVGIcons;
};

const HIVE_CHAIN_LOGO = '/assets/images/wallet/hive-logo.svg';
const HIVE_ENGINE_CHAIN_LOGO = '/assets/images/wallet/hive-engine.svg';

const HIVE_CHAIN_FILTER_VALUE = 'hive';
const HIVE_ENGINE_CHAIN_FILTER_VALUE = 'hive_engine';
const EVM_CHAIN_FILTER_PREFIX = 'evm:';

export const buildCanonicalAssetChainFilterValue = (
  asset: PortfolioCanonicalAsset,
): string | null => {
  if (asset.ecosystem === 'hive') {
    return HIVE_CHAIN_FILTER_VALUE;
  }

  if (asset.ecosystem === 'hive_engine') {
    return HIVE_ENGINE_CHAIN_FILTER_VALUE;
  }

  if (isDestinationOnlyPortfolioEcosystem(asset.ecosystem)) {
    const chainId = asset.chainId?.trim().toLowerCase();
    if (!chainId) {
      return null;
    }

    return `${asset.ecosystem}:${chainId}`;
  }

  const normalizedChainId = normalizeChainId(asset.chainId);
  if (!normalizedChainId) {
    return null;
  }

  return `${EVM_CHAIN_FILTER_PREFIX}${normalizedChainId}`;
};

export const buildCanonicalAssetChainFilterOptions = (
  assets: PortfolioCanonicalAsset[],
  chains: EvmChain[] = [],
  portfolioChains: PortfolioChainDisplayRecord = {},
): PortfolioAssetChainFilterOption[] => {
  const optionsByValue = new Map<string, PortfolioAssetChainFilterOption>();

  for (const asset of assets) {
    const value = buildCanonicalAssetChainFilterValue(asset);
    if (!value || optionsByValue.has(value)) {
      continue;
    }

    if (value === HIVE_CHAIN_FILTER_VALUE) {
      optionsByValue.set(value, {
        value,
        label: 'Hive',
        key: value,
        img: HIVE_CHAIN_LOGO,
      });
      continue;
    }

    if (value === HIVE_ENGINE_CHAIN_FILTER_VALUE) {
      optionsByValue.set(value, {
        value,
        label: 'Hive Engine',
        key: value,
        img: HIVE_ENGINE_CHAIN_LOGO,
      });
      continue;
    }

    if (
      value.startsWith('utxo:') ||
      value.startsWith('svm:') ||
      value.startsWith('mvm:') ||
      value.startsWith('tvm:') ||
      value.startsWith('external:')
    ) {
      const [ecosystem, chainId] = value.split(':');
      const portfolioChain = resolvePortfolioChainDisplay(chainId, portfolioChains);
      optionsByValue.set(value, {
        value,
        label:
          portfolioChain?.name ??
          (chainId ? chainId.charAt(0).toUpperCase() + chainId.slice(1) : ecosystem),
        key: value,
        img: portfolioChain?.logoUrl ?? undefined,
      });
      continue;
    }

    const chainId = value.slice(EVM_CHAIN_FILTER_PREFIX.length);
    const portfolioChain = resolvePortfolioChainDisplay(chainId, portfolioChains);
    const chain = resolveEvmChainForChainReference(chainId, chains);
    optionsByValue.set(value, {
      value,
      label: portfolioChain?.name ?? chain?.name ?? asset.chainId ?? chainId,
      key: value,
      img: portfolioChain?.logoUrl ?? chain?.logo,
      imgChip: chain?.testnet ? SVGIcons.EVM_CHAIN_TESTNET : undefined,
    });
  }

  return [...optionsByValue.values()].sort((left, right) =>
    left.label.localeCompare(right.label),
  );
};

const getCanonicalAssetTextMatchRank = (
  text: string,
  normalizedFilter: string,
  baseRank: number,
): number => {
  const normalizedText = text.toLowerCase();
  if (normalizedText === normalizedFilter) {
    return baseRank;
  }

  if (normalizedText.startsWith(normalizedFilter)) {
    return baseRank + 1;
  }

  if (normalizedText.includes(normalizedFilter)) {
    return baseRank + 2;
  }

  return Number.POSITIVE_INFINITY;
};

const getCanonicalAssetTextFilterRank = (
  asset: PortfolioCanonicalAsset,
  filter: string,
): number => {
  const normalizedFilter = filter.trim().toLowerCase();
  if (!normalizedFilter) {
    return 0;
  }

  return Math.min(
    getCanonicalAssetTextMatchRank(asset.symbol, normalizedFilter, 0),
    getCanonicalAssetTextMatchRank(asset.name, normalizedFilter, 3),
  );
};

const getCanonicalAssetPriceUsd = (asset: PortfolioCanonicalAsset): number =>
  typeof asset.priceUsd === 'number' && Number.isFinite(asset.priceUsd)
    ? asset.priceUsd
    : 0;

const getCanonicalAssetRankScore = (asset: PortfolioCanonicalAsset): number =>
  typeof asset.rankScore === 'number' && Number.isFinite(asset.rankScore)
    ? asset.rankScore
    : 0;

const compareCanonicalAssetsByPriceUsd = (
  left: PortfolioCanonicalAsset,
  right: PortfolioCanonicalAsset,
): number => {
  const priceDiff =
    getCanonicalAssetPriceUsd(right) - getCanonicalAssetPriceUsd(left);
  if (priceDiff !== 0) {
    return priceDiff;
  }

  return left.symbol.localeCompare(right.symbol);
};

const compareCanonicalAssetsByRank = (
  left: PortfolioCanonicalAsset,
  right: PortfolioCanonicalAsset,
): number => {
  const rankDiff =
    getCanonicalAssetRankScore(right) - getCanonicalAssetRankScore(left);
  if (rankDiff !== 0) {
    return rankDiff;
  }

  return compareCanonicalAssetsByPriceUsd(left, right);
};

export const sortCanonicalAssetsByPriceUsd = (
  assets: PortfolioCanonicalAsset[],
): PortfolioCanonicalAsset[] =>
  [...assets].sort(compareCanonicalAssetsByPriceUsd);

/** Sorts by API `rankScore` (desc), then `priceUsd`, then symbol. */
export const sortCanonicalAssetsByRank = (
  assets: PortfolioCanonicalAsset[],
): PortfolioCanonicalAsset[] =>
  [...assets].sort(compareCanonicalAssetsByRank);

const compareCanonicalAssetsByTextFilter = (
  left: PortfolioCanonicalAsset,
  right: PortfolioCanonicalAsset,
  filter: string,
): number => {
  const rankDiff =
    getCanonicalAssetTextFilterRank(left, filter) -
    getCanonicalAssetTextFilterRank(right, filter);
  if (rankDiff !== 0) {
    return rankDiff;
  }

  return compareCanonicalAssetsByRank(left, right);
};

const matchesCanonicalAssetTextFilter = (
  asset: PortfolioCanonicalAsset,
  filter: string,
): boolean => {
  const normalizedFilter = filter.trim().toLowerCase();
  if (!normalizedFilter) {
    return true;
  }

  const normalizedSymbol = asset.symbol.toLowerCase();
  const normalizedName = asset.name.toLowerCase();

  return (
    normalizedSymbol.includes(normalizedFilter) ||
    normalizedName.includes(normalizedFilter)
  );
};

const matchesCanonicalAssetChainFilter = (
  asset: PortfolioCanonicalAsset,
  chainFilter: string,
): boolean => {
  if (!chainFilter) {
    return true;
  }

  return buildCanonicalAssetChainFilterValue(asset) === chainFilter;
};

const isHiveKeychainSwapTargetAsset = (asset: PortfolioCanonicalAsset): boolean =>
  asset.ecosystem === 'hive' &&
  HIVE_KEYCHAIN_SWAP_TARGET_SYMBOLS.has(asset.symbol.toUpperCase());

const isHiveExternalBridgeTargetAsset = (asset: PortfolioCanonicalAsset): boolean =>
  asset.ecosystem === 'hive' &&
  HIVE_EXTERNAL_BRIDGE_TARGET_SYMBOLS.has(asset.symbol.toUpperCase());

export const isEligibleToAssetForFromAsset = (
  fromAsset: PortfolioCanonicalAsset,
  toAsset: PortfolioCanonicalAsset,
): boolean => {
  if (fromAsset.assetId === toAsset.assetId) {
    return false;
  }

  if (isPortfolioSwapExcludedAsset(toAsset)) {
    return false;
  }

  switch (fromAsset.ecosystem) {
    case 'hive_engine':
      return (
        toAsset.ecosystem === 'hive_engine' || isHiveKeychainSwapTargetAsset(toAsset)
      );
    case 'hive': {
      const fromSymbol = fromAsset.symbol.toUpperCase();
      if (isPortfolioSwapExcludedSymbol(fromSymbol)) {
        return false;
      }
      if (fromSymbol === 'HBD') {
        return (
          toAsset.ecosystem === 'hive' || toAsset.ecosystem === 'hive_engine'
        );
      }
      return true;
    }
    case 'evm':
      return (
        toAsset.ecosystem === 'evm' ||
        isHiveExternalBridgeTargetAsset(toAsset) ||
        isDestinationOnlyPortfolioEcosystem(toAsset.ecosystem)
      );
    default:
      return false;
  }
};

export const filterToAssetsByFromAsset = (
  assets: PortfolioCanonicalAsset[],
  fromAsset: PortfolioCanonicalAsset | undefined,
): PortfolioCanonicalAsset[] => {
  const swappableAssets = assets.filter(
    (asset) => !isPortfolioSwapExcludedAsset(asset),
  );

  if (!fromAsset) {
    return swappableAssets;
  }

  return swappableAssets.filter((asset) =>
    isEligibleToAssetForFromAsset(fromAsset, asset),
  );
};

export const filterCanonicalAssets = (
  assets: PortfolioCanonicalAsset[],
  options: {
    textFilter?: string;
    chainFilter?: string;
    maxResults?: number;
  } = {},
): { assets: PortfolioCanonicalAsset[]; totalMatches: number } => {
  const maxResults = options.maxResults ?? Number.POSITIVE_INFINITY;
  const textFilter = options.textFilter ?? '';
  const filteredAssets = assets.filter(
    (asset) =>
      matchesCanonicalAssetTextFilter(asset, textFilter) &&
      matchesCanonicalAssetChainFilter(asset, options.chainFilter ?? ''),
  );
  const sortedAssets = textFilter.trim()
    ? [...filteredAssets].sort((left, right) =>
        compareCanonicalAssetsByTextFilter(left, right, textFilter),
      )
    : sortCanonicalAssetsByRank(filteredAssets);

  return {
    assets: sortedAssets.slice(0, maxResults),
    totalMatches: filteredAssets.length,
  };
};

export const getDefaultSelectOptionValue = (
  options: PortfolioFlowSelectOption[],
): string => options[0]?.value ?? '';

export const resolveFromRowKeyToCanonicalAssetId = (
  rowKey: string,
  rows: PortfolioFlowRow[],
  assets: PortfolioCanonicalAsset[],
  chains: EvmChain[] = [],
  portfolioChains: PortfolioChainDisplayRecord = {},
): string | undefined => {
  const row = rows.find((item) => item.key === rowKey);
  if (!row) {
    return assets.some((asset) => asset.assetId === rowKey) ? rowKey : undefined;
  }

  return resolvePortfolioRowToCanonicalAssetId(
    row,
    assets,
    chains,
    portfolioChains,
  );
};

export type PortfolioRecipientAddressKind =
  | 'evm'
  | 'hive'
  | PortfolioDestinationOnlyEcosystem;

const HIVE_PORTFOLIO_ECOSYSTEMS = new Set<PortfolioEcosystem>([
  'hive',
  'hive_engine',
]);

const DESTINATION_ONLY_ECOSYSTEMS = new Set<PortfolioDestinationOnlyEcosystem>([
  'utxo',
  'svm',
  'mvm',
  'tvm',
  'external',
]);

const BITCOIN_ADDRESS_PATTERN =
  /^(bc1[a-z0-9]{25,87}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/i;
const SOLANA_ADDRESS_PATTERN = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const SUI_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{64}$/;
const TRON_ADDRESS_PATTERN = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;
const GENERIC_DESTINATION_ADDRESS_PATTERN = /^[^\s]{10,200}$/;

const resolveUtxoAddressPattern = (chainId?: string | null): RegExp => {
  switch (chainId?.trim().toLowerCase()) {
    case 'bitcoin':
      return BITCOIN_ADDRESS_PATTERN;
    case 'litecoin':
      return /^(ltc1[a-z0-9]{25,87}|[LM3][a-km-zA-HJ-NP-Z1-9]{26,33})$/i;
    case 'dogecoin':
      return /^D[1-9A-HJ-NP-Za-km-z]{33}$/;
    case 'bitcoin-cash':
      return /^((bitcoincash:)?(q|p)[a-z0-9]{41}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/i;
    default:
      return /^[a-zA-Z0-9:._-]{26,120}$/;
  }
};

const resolveExternalAddressPattern = (chainId?: string | null): RegExp => {
  switch (chainId?.trim().toLowerCase()) {
    case 'ripple':
      return /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/;
    case 'cardano':
      return /^addr1[a-z0-9]{50,110}$/;
    case 'polkadot':
      return /^1[a-zA-Z0-9]{47,48}$/;
    case 'cosmos':
      return /^cosmos1[a-z0-9]{38,58}$/;
    case 'algorand':
      return /^[A-Z2-7]{58}$/;
    case 'stellar':
      return /^G[A-Z2-7]{55}$/;
    case 'near':
      return /^([a-z0-9._-]+\.)*[a-z0-9._-]+\.near$|^[a-f0-9]{64}$/;
    default:
      return GENERIC_DESTINATION_ADDRESS_PATTERN;
  }
};

export const isDestinationOnlyPortfolioEcosystem = (
  ecosystem: PortfolioEcosystem,
): ecosystem is PortfolioDestinationOnlyEcosystem =>
  DESTINATION_ONLY_ECOSYSTEMS.has(ecosystem as PortfolioDestinationOnlyEcosystem);

export const filterActionableSwapSourceAssets = (
  assets: PortfolioCanonicalAsset[],
): PortfolioCanonicalAsset[] =>
  assets.filter((asset) => !isDestinationOnlyPortfolioEcosystem(asset.ecosystem));

const HIVE_ACCOUNT_NAME_PATTERN =
  /^(?=.{3,16}$)[a-z]([0-9a-z]|[0-9a-z\-](?=[0-9a-z])){2,}([\.](?=[a-z][0-9a-z\-][0-9a-z\-])[a-z]([0-9a-z]|[0-9a-z\-](?=[0-9a-z])){1,}){0,}$/;

export const isHivePortfolioEcosystem = (
  ecosystem: PortfolioCanonicalAsset['ecosystem'],
): boolean => HIVE_PORTFOLIO_ECOSYSTEMS.has(ecosystem);

export const requiresPortfolioRecipientAddress = (
  fromAsset: PortfolioCanonicalAsset | undefined,
  toAsset: PortfolioCanonicalAsset | undefined,
): boolean => {
  if (!toAsset) {
    return false;
  }

  if (isDestinationOnlyPortfolioEcosystem(toAsset.ecosystem)) {
    return true;
  }

  if (!fromAsset) {
    return false;
  }

  const fromIsHive = isHivePortfolioEcosystem(fromAsset.ecosystem);
  const toIsHive = isHivePortfolioEcosystem(toAsset.ecosystem);

  return (
    (fromIsHive && toAsset.ecosystem === 'evm') ||
    (fromAsset.ecosystem === 'evm' && toIsHive)
  );
};

export const resolvePortfolioRecipientAddressKind = (
  toAsset: PortfolioCanonicalAsset,
): PortfolioRecipientAddressKind => {
  if (toAsset.ecosystem === 'evm') {
    return 'evm';
  }

  if (isDestinationOnlyPortfolioEcosystem(toAsset.ecosystem)) {
    return toAsset.ecosystem;
  }

  return 'hive';
};

export const resolvePortfolioRecipientAddressLabelKey = (
  toAsset: PortfolioCanonicalAsset | undefined,
): string => {
  switch (toAsset?.ecosystem) {
    case 'evm':
      return 'evm_swap_receiver_address';
    case 'utxo':
      return toAsset.chainId?.toLowerCase() === 'bitcoin'
        ? 'portfolio_recipient_bitcoin_address'
        : 'portfolio_recipient_destination_address';
    case 'svm':
      return 'portfolio_recipient_solana_address';
    case 'mvm':
      return 'portfolio_recipient_sui_address';
    case 'tvm':
      return 'portfolio_recipient_tron_address';
    case 'external':
      return 'portfolio_recipient_destination_address';
    default:
      return 'portfolio_recipient_hive_account';
  }
};

export const normalizePortfolioRecipientAddress = (address: string): string =>
  address.trim().replace(/^@+/, '');

export const isValidPortfolioRecipientAddress = (
  address: string,
  kind: PortfolioRecipientAddressKind,
  chainId?: string | null,
): boolean => {
  const normalized = normalizePortfolioRecipientAddress(address);
  if (!normalized) {
    return false;
  }

  switch (kind) {
    case 'evm':
      return EvmAddressUtils.isValidEvmAddress(normalized);
    case 'hive':
      return HIVE_ACCOUNT_NAME_PATTERN.test(normalized);
    case 'utxo':
      return resolveUtxoAddressPattern(chainId).test(normalized);
    case 'svm':
      return SOLANA_ADDRESS_PATTERN.test(normalized);
    case 'mvm':
      return SUI_ADDRESS_PATTERN.test(normalized);
    case 'tvm':
      return TRON_ADDRESS_PATTERN.test(normalized);
    case 'external':
      return resolveExternalAddressPattern(chainId).test(normalized);
    default:
      return false;
  }
};

export const resolvePortfolioToAddress = ({
  fromAddress,
  recipientAddress,
  fromAsset,
  toAsset,
}: {
  fromAddress: string;
  recipientAddress: string;
  fromAsset: PortfolioCanonicalAsset | undefined;
  toAsset: PortfolioCanonicalAsset | undefined;
}): string | undefined => {
  if (!toAsset) {
    return undefined;
  }

  if (isDestinationOnlyPortfolioEcosystem(toAsset.ecosystem)) {
    const kind = resolvePortfolioRecipientAddressKind(toAsset);
    const normalizedRecipient = normalizePortfolioRecipientAddress(recipientAddress);
    if (
      !isValidPortfolioRecipientAddress(
        normalizedRecipient,
        kind,
        toAsset.chainId,
      )
    ) {
      return undefined;
    }

    return normalizedRecipient;
  }

  if (!requiresPortfolioRecipientAddress(fromAsset, toAsset)) {
    return fromAddress;
  }

  const kind = resolvePortfolioRecipientAddressKind(toAsset);
  const normalizedRecipient = normalizePortfolioRecipientAddress(recipientAddress);
  if (
    !isValidPortfolioRecipientAddress(
      normalizedRecipient,
      kind,
      toAsset.chainId,
    )
  ) {
    return undefined;
  }

  return normalizedRecipient;
};

export const PortfolioFlowUtils = {
  buildCanonicalAssetChainFilterOptions,
  buildCanonicalAssetChainFilterValue,
  buildCanonicalAssetSelectOptions,
  buildPortfolioFromSelectOptions,
  filterActionableSwapSourceAssets,
  filterCanonicalAssets,
  filterToAssetsByFromAsset,
  isDestinationOnlyPortfolioEcosystem,
  isEligibleToAssetForFromAsset,
  isHivePortfolioEcosystem,
  isPortfolioSwapExcludedAsset,
  isPortfolioSwapExcludedSymbol,
  isValidPortfolioRecipientAddress,
  formatPortfolioQuoteFromAmount,
  formatPortfolioTokenBalance,
  getDefaultSelectOptionValue,
  getHivePortfolioRowEcosystem,
  getHiveTokenIcon,
  resolveHivePortfolioRowNetworkLogoUrl,
  hasPositivePortfolioBalance,
  resolveCanonicalAssetNetworkLabel,
  resolveCanonicalAssetNetworkLogoUrl,
  resolveEvmChainForChainReference,
  resolveEvmChainLogoUrl,
  portfolioRowMatchesCanonicalAsset,
  resolvePortfolioRowToSwapFromAssetId,
  resolveFromRowKeyToCanonicalAssetId,
  resolveHiveTokenDecimals,
  resolvePortfolioQuoteFromAmountDecimals,
  normalizePortfolioRecipientAddress,
  requiresPortfolioRecipientAddress,
  resolvePortfolioRecipientAddressKind,
  resolvePortfolioRecipientAddressLabelKey,
  resolvePortfolioRowToCanonicalAsset,
  resolvePortfolioRowToCanonicalAssetId,
  resolvePortfolioToAddress,
  sortCanonicalAssetsByPriceUsd,
  sortCanonicalAssetsByRank,
};
