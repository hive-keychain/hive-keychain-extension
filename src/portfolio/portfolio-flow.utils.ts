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
  buildCanonicalAssetSelectOptions,
  buildPortfolioFromSelectOptions,
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
