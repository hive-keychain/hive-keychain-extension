import FormatUtils from 'src/utils/format.utils';

export type PortfolioAllocationInput = {
  key: string;
  symbol: string;
  network: string;
  usdValue: number | null;
};

export type PortfolioAllocationSlice = {
  key: string;
  symbol: string;
  network: string;
  usdValue: number;
  share: number;
  color: string;
};

export type PortfolioAllocation = {
  totalUsd: number;
  hasKnownValue: boolean;
  slices: PortfolioAllocationSlice[];
};

const ALLOCATION_COLORS = [
  '#E31337',
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#06B6D4',
  '#F97316',
  '#EC4899',
  '#84CC16',
  '#6366F1',
  '#14B8A6',
  '#0EA5E9',
];

const isKnownUsdValue = (
  value: number | null,
): value is number => value !== null && Number.isFinite(value);

const buildPortfolioAllocation = (
  rows: PortfolioAllocationInput[],
): PortfolioAllocation => {
  let totalUsd = 0;
  let hasKnownValue = false;

  for (const row of rows) {
    if (!isKnownUsdValue(row.usdValue)) {
      continue;
    }

    hasKnownValue = true;
    totalUsd += row.usdValue;
  }

  const positiveRows = rows.filter(
    (row): row is PortfolioAllocationInput & { usdValue: number } =>
      isKnownUsdValue(row.usdValue) && row.usdValue > 0,
  );
  const positiveTotal = positiveRows.reduce(
    (sum, row) => sum + row.usdValue,
    0,
  );

  const slices = [...positiveRows]
    .sort((left, right) => {
      if (right.usdValue !== left.usdValue) {
        return right.usdValue - left.usdValue;
      }

      return left.symbol.localeCompare(right.symbol);
    })
    .map((row, index) => ({
      key: row.key,
      symbol: row.symbol.toUpperCase(),
      network: row.network,
      usdValue: row.usdValue,
      share: positiveTotal > 0 ? row.usdValue / positiveTotal : 0,
      color: ALLOCATION_COLORS[index % ALLOCATION_COLORS.length],
    }));

  return {
    totalUsd,
    hasKnownValue,
    slices,
  };
};

const formatPortfolioAllocationPercent = (share: number): string => {
  const percent = share * 100;
  if (!Number.isFinite(percent) || percent <= 0) {
    return `${FormatUtils.withCommas(0, 0, true)}%`;
  }

  if (percent < 0.05) {
    return `<${FormatUtils.withCommas(0.1, 1)}%`;
  }

  return `${FormatUtils.withCommas(percent, 1, true)}%`;
};

export const PortfolioAllocationUtils = {
  ALLOCATION_COLORS,
  buildPortfolioAllocation,
  formatPortfolioAllocationPercent,
};
