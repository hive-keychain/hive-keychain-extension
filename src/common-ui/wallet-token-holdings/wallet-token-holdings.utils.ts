import { WalletTokenPriceChartUtils } from 'src/common-ui/wallet-token-price-chart/wallet-token-price-chart.utils';
import FormatUtils from 'src/utils/format.utils';

const parseWalletTokenAmount = (
  value: string | number | { toString(): string } | null | undefined,
): number => {
  if (value === null || value === undefined) {
    return Number.NaN;
  }
  const raw = typeof value === 'number' ? value.toString() : value.toString();
  const numeric = parseFloat(raw.replace(/,/g, '').split(' ')[0]);
  return Number.isFinite(numeric) ? numeric : Number.NaN;
};

const formatWalletTokenHoldingUsd = (
  amount: number,
  unitPriceUsd: number | null | undefined,
): string | undefined => {
  if (
    typeof unitPriceUsd !== 'number' ||
    !WalletTokenPriceChartUtils.hasKnownTokenPrice(unitPriceUsd)
  ) {
    return undefined;
  }
  if (!Number.isFinite(amount) || amount < 0) {
    return undefined;
  }

  const usdValue = amount * unitPriceUsd;
  const formatted = FormatUtils.formatCurrencyValue(usdValue, 2);
  if (usdValue > 0 && Number(formatted.replace(/,/g, '')) === 0) {
    return '~$0.00';
  }
  return `$${formatted}`;
};

export const WalletTokenHoldingsUtils = {
  parseWalletTokenAmount,
  formatWalletTokenHoldingUsd,
};
