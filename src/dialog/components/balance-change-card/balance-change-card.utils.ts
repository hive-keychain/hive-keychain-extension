import type { BalanceInfo } from './balance-change-card.interface';

const hasInsufficientBalance = (balanceInfo?: BalanceInfo): boolean =>
  [balanceInfo?.mainBalance, balanceInfo?.feeBalance].some(
    (balance) => balance?.insufficientBalance,
  );

export const BalanceChangeCardUtils = {
  hasInsufficientBalance,
};
