import { evmChainIdToDecimalPathSegment } from '@popup/evm/utils/evm-light-node.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import Decimal from 'decimal.js';
import { SVGIcons } from 'src/common-ui/icons.enum';
import {
  PortfolioCanonicalAsset,
  PortfolioMode,
} from 'src/portfolio/portfolio-api.interface';
import { EvmAddressUtils } from 'src/utils/evm/evm-address.utils';

const HIVE_CORE_SYMBOLS = new Set(['HIVE', 'HBD', 'HP']);
const HIVE_KEYCHAIN_SWAP_TARGET_SYMBOLS = new Set(['HIVE', 'HBD']);
const HIVE_EXTERNAL_BRIDGE_TARGET_SYMBOLS = new Set(['HIVE']);
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
  if (parts[0] !== 'evm' || parts.length < 4) {
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

const assetChainMatchesRow = (
  asset: PortfolioCanonicalAsset,
  rowChainReference: string,
  chains: EvmChain[],
): boolean => {
  const rowChain = resolveEvmChainForChainReference(rowChainReference, chains);
  const assetChain = resolveAssetEvmChain(asset, chains);

  if (rowChain && assetChain) {
    return chainIdsMatch(rowChain.chainId, assetChain.chainId);
  }

  return getChainReferencesFromAsset(asset).some((chainReference) =>
    chainIdsMatch(chainReference, rowChainReference),
  );
};

const resolveEvmPortfolioRowToCanonicalAsset = (
  row: PortfolioFlowRow,
  assets: PortfolioCanonicalAsset[],
  chains: EvmChain[],
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

      return assetChainMatchesRow(asset, parsedRow.chainReference, chains);
    });
  }

  return assets.find((asset) => {
    if (asset.ecosystem !== 'evm') {
      return false;
    }

    if (getContractAddressFromAssetId(asset.assetId)) {
      return false;
    }

    if (asset.symbol.toUpperCase() !== normalizedSymbol) {
      return false;
    }

    return assetChainMatchesRow(asset, parsedRow.chainReference, chains);
  });
};

export const getHivePortfolioRowEcosystem = (
  symbol: string,
): 'hive' | 'hive_engine' =>
  HIVE_CORE_SYMBOLS.has(symbol.toUpperCase()) ? 'hive' : 'hive_engine';

const normalizeChainReference = (
  value: string | null | undefined,
): string | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed.toLowerCase() : null;
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
    const references = [
      chain.name,
      chain.network,
      chain.openSeaChainId,
      chain.nativeCoinId,
    ];

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
): PortfolioCanonicalAsset | undefined => {
  const parsedEvmRow = parsePortfolioEvmRowKey(row);
  if (parsedEvmRow) {
    return resolveEvmPortfolioRowToCanonicalAsset(row, assets, chains);
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
): string | undefined =>
  resolvePortfolioRowToCanonicalAsset(row, assets, chains)?.assetId;

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

export const resolveCanonicalAssetNetworkLabel = (
  asset: PortfolioCanonicalAsset,
  chains: EvmChain[],
): string => {
  if (asset.ecosystem === 'hive') {
    return 'Hive';
  }

  if (asset.ecosystem === 'hive_engine') {
    return 'Hive Engine';
  }

  const chain = resolveEvmChainForChainReference(asset.chainId, chains);
  if (chain) {
    return chain.name;
  }

  return asset.chainId ?? '';
};

export const resolveCanonicalAssetNetworkLogoUrl = (
  asset: PortfolioCanonicalAsset,
  chains: EvmChain[],
): string | null => {
  if (asset.ecosystem === 'hive') {
    return HIVE_CHAIN_LOGO;
  }

  if (asset.ecosystem === 'hive_engine') {
    return HIVE_ENGINE_CHAIN_LOGO;
  }

  return resolveEvmChainForChainReference(asset.chainId, chains)?.logo ?? null;
};

export const buildCanonicalAssetSelectOptions = (
  assets: PortfolioCanonicalAsset[],
  chains: EvmChain[] = [],
): PortfolioFlowSelectOption[] =>
  assets.map((asset) => ({
    value: asset.assetId,
    label: `${asset.symbol} - ${resolveCanonicalAssetNetworkLabel(asset, chains)}`,
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
    const chain = resolveEvmChainForChainReference(chainId, chains);
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

  switch (fromAsset.ecosystem) {
    case 'hive_engine':
      return (
        toAsset.ecosystem === 'hive_engine' || isHiveKeychainSwapTargetAsset(toAsset)
      );
    case 'hive':
      return true;
    case 'evm':
      return toAsset.ecosystem === 'evm' || isHiveExternalBridgeTargetAsset(toAsset);
    default:
      return false;
  }
};

export const filterToAssetsByFromAsset = (
  assets: PortfolioCanonicalAsset[],
  fromAsset: PortfolioCanonicalAsset | undefined,
): PortfolioCanonicalAsset[] => {
  if (!fromAsset) {
    return assets;
  }

  return assets.filter((asset) => isEligibleToAssetForFromAsset(fromAsset, asset));
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
  chains: EvmChain[] = [],
): string | undefined => {
  const row = rows.find((item) => item.key === rowKey);
  if (!row) {
    return assets.some((asset) => asset.assetId === rowKey) ? rowKey : undefined;
  }

  return resolvePortfolioRowToCanonicalAssetId(row, assets, chains);
};

export type PortfolioRecipientAddressKind = 'evm' | 'hive';

const HIVE_PORTFOLIO_ECOSYSTEMS = new Set<PortfolioCanonicalAsset['ecosystem']>([
  'hive',
  'hive_engine',
]);

const HIVE_ACCOUNT_NAME_PATTERN =
  /^(?=.{3,16}$)[a-z]([0-9a-z]|[0-9a-z\-](?=[0-9a-z])){2,}([\.](?=[a-z][0-9a-z\-][0-9a-z\-])[a-z]([0-9a-z]|[0-9a-z\-](?=[0-9a-z])){1,}){0,}$/;

export const isHivePortfolioEcosystem = (
  ecosystem: PortfolioCanonicalAsset['ecosystem'],
): boolean => HIVE_PORTFOLIO_ECOSYSTEMS.has(ecosystem);

export const requiresPortfolioRecipientAddress = (
  fromAsset: PortfolioCanonicalAsset | undefined,
  toAsset: PortfolioCanonicalAsset | undefined,
): boolean => {
  if (!fromAsset || !toAsset) {
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
): PortfolioRecipientAddressKind =>
  toAsset.ecosystem === 'evm' ? 'evm' : 'hive';

export const resolvePortfolioRecipientAddressLabelKey = (
  toAsset: PortfolioCanonicalAsset | undefined,
): string =>
  toAsset?.ecosystem === 'evm'
    ? 'evm_swap_receiver_address'
    : 'portfolio_recipient_hive_account';

export const normalizePortfolioRecipientAddress = (address: string): string =>
  address.trim().replace(/^@+/, '');

export const isValidPortfolioRecipientAddress = (
  address: string,
  kind: PortfolioRecipientAddressKind,
): boolean => {
  const normalized = normalizePortfolioRecipientAddress(address);
  if (!normalized) {
    return false;
  }

  if (kind === 'evm') {
    return EvmAddressUtils.isValidEvmAddress(normalized);
  }

  return HIVE_ACCOUNT_NAME_PATTERN.test(normalized);
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
  if (!requiresPortfolioRecipientAddress(fromAsset, toAsset)) {
    return fromAddress;
  }

  if (!toAsset) {
    return undefined;
  }

  const kind = resolvePortfolioRecipientAddressKind(toAsset);
  const normalizedRecipient = normalizePortfolioRecipientAddress(recipientAddress);
  if (!isValidPortfolioRecipientAddress(normalizedRecipient, kind)) {
    return undefined;
  }

  return normalizedRecipient;
};

export const PortfolioFlowUtils = {
  buildCanonicalAssetChainFilterOptions,
  buildCanonicalAssetChainFilterValue,
  buildCanonicalAssetSelectOptions,
  buildPortfolioFromSelectOptions,
  filterCanonicalAssets,
  filterToAssetsByFromAsset,
  isEligibleToAssetForFromAsset,
  isHivePortfolioEcosystem,
  isValidPortfolioRecipientAddress,
  formatPortfolioQuoteFromAmount,
  formatPortfolioTokenBalance,
  getDefaultSelectOptionValue,
  getHivePortfolioRowEcosystem,
  getHiveTokenIcon,
  hasPositivePortfolioBalance,
  resolveCanonicalAssetNetworkLabel,
  resolveCanonicalAssetNetworkLogoUrl,
  resolveEvmChainForChainReference,
  resolveEvmChainLogoUrl,
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
};
