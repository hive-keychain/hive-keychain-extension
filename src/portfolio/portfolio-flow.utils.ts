import { evmChainIdToDecimalPathSegment } from '@popup/evm/utils/evm-light-node.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { PortfolioCanonicalAsset } from 'src/portfolio/portfolio-api.interface';

const HIVE_CORE_SYMBOLS = new Set(['HIVE', 'HBD', 'HP']);

export type PortfolioFlowRow = {
  key: string;
  symbol: string;
  network: string;
  balance: string;
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

export const getHivePortfolioRowEcosystem = (
  symbol: string,
): 'hive' | 'hive_engine' =>
  HIVE_CORE_SYMBOLS.has(symbol.toUpperCase()) ? 'hive' : 'hive_engine';

export const resolveEvmChainLogoUrl = (
  chainId: string | null | undefined,
  chains: EvmChain[],
): string | null => {
  if (!chainId) {
    return null;
  }

  const chain = chains.find((item) => chainIdsMatch(item.chainId, chainId));
  return chain?.logo ?? null;
};

export const resolvePortfolioRowToCanonicalAsset = (
  row: PortfolioFlowRow,
  assets: PortfolioCanonicalAsset[],
): PortfolioCanonicalAsset | undefined => {
  const normalizedSymbol = row.symbol.toUpperCase();

  if (row.chainId) {
    return assets.find(
      (asset) =>
        asset.ecosystem === 'evm' &&
        asset.symbol.toUpperCase() === normalizedSymbol &&
        chainIdsMatch(asset.chainId, row.chainId),
    );
  }

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
): string | undefined =>
  resolvePortfolioRowToCanonicalAsset(row, assets)?.assetId;

export const buildPortfolioFromSelectOptions = (
  rows: PortfolioFlowRow[],
): PortfolioFlowSelectOption[] =>
  rows
    .filter((row) => hasPositivePortfolioBalance(row.balance))
    .filter((row) => !row.isTestnet)
    .map((row) => {
      const formattedBalance = formatPortfolioTokenBalance(row.balance);
      return {
        value: row.key,
        label: row.network
          ? `${row.symbol} - ${row.network} (${formattedBalance})`
          : `${row.symbol} (${formattedBalance})`,
      };
    });

export const buildCanonicalAssetSelectOptions = (
  assets: PortfolioCanonicalAsset[],
): PortfolioFlowSelectOption[] =>
  assets.map((asset) => ({
    value: asset.assetId,
    label: `${asset.symbol} - ${asset.name}`,
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

  const normalizedChainId = normalizeChainId(asset.chainId);
  if (!normalizedChainId) {
    return null;
  }

  return `${EVM_CHAIN_FILTER_PREFIX}${normalizedChainId}`;
};

export const buildCanonicalAssetChainFilterOptions = (
  assets: PortfolioCanonicalAsset[],
  chains: EvmChain[],
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

    const chainId = value.slice(EVM_CHAIN_FILTER_PREFIX.length);
    const chain = chains.find((item) => chainIdsMatch(item.chainId, chainId));
    optionsByValue.set(value, {
      value,
      label: chain?.name ?? asset.chainId ?? chainId,
      key: value,
      img: chain?.logo,
      imgChip: chain?.testnet ? SVGIcons.EVM_CHAIN_TESTNET : undefined,
    });
  }

  return [...optionsByValue.values()].sort((left, right) =>
    left.label.localeCompare(right.label),
  );
};

const getCanonicalAssetTextFilterRank = (
  asset: PortfolioCanonicalAsset,
  filter: string,
): number => {
  const normalizedFilter = filter.trim().toLowerCase();
  if (!normalizedFilter) {
    return 0;
  }

  const normalizedSymbol = asset.symbol.toLowerCase();
  if (normalizedSymbol === normalizedFilter) {
    return 0;
  }

  if (normalizedSymbol.startsWith(normalizedFilter)) {
    return 1;
  }

  return 2;
};

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

  return left.symbol.localeCompare(right.symbol);
};

const matchesCanonicalAssetTextFilter = (
  asset: PortfolioCanonicalAsset,
  filter: string,
): boolean => {
  const normalizedFilter = filter.trim().toLowerCase();
  if (!normalizedFilter) {
    return true;
  }

  return asset.symbol.toLowerCase().includes(normalizedFilter);
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
    : filteredAssets;

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
): string | undefined => {
  const row = rows.find((item) => item.key === rowKey);
  if (!row) {
    return assets.some((asset) => asset.assetId === rowKey) ? rowKey : undefined;
  }

  return resolvePortfolioRowToCanonicalAssetId(row, assets);
};

export const PortfolioFlowUtils = {
  buildCanonicalAssetChainFilterOptions,
  buildCanonicalAssetChainFilterValue,
  buildCanonicalAssetSelectOptions,
  buildPortfolioFromSelectOptions,
  filterCanonicalAssets,
  formatPortfolioTokenBalance,
  getDefaultSelectOptionValue,
  getHivePortfolioRowEcosystem,
  getHiveTokenIcon,
  hasPositivePortfolioBalance,
  resolveEvmChainLogoUrl,
  resolveFromRowKeyToCanonicalAssetId,
  resolvePortfolioRowToCanonicalAsset,
  resolvePortfolioRowToCanonicalAssetId,
};
