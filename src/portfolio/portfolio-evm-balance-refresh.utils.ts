import { BackgroundCommand } from '@reference-data/background-message-key.enum';

export const PORTFOLIO_EVM_BALANCE_REFRESH_DEBOUNCE_MS = 1500;

export type PortfolioEvmBalanceRefreshMessage = {
  command?: BackgroundCommand | string;
  value?: {
    from?: string;
    address?: string;
  };
};

export const resolvePortfolioEvmBalanceRefreshAddress = (
  message: PortfolioEvmBalanceRefreshMessage,
): string | undefined => {
  if (message.command === BackgroundCommand.EVM_TRANSACTION_RESOLVED) {
    const from = message.value?.from?.trim().toLowerCase();
    return from || undefined;
  }

  if (message.command === BackgroundCommand.EVM_INCOMING_TRANSACTION) {
    const address = message.value?.address?.trim().toLowerCase();
    return address || undefined;
  }

  return undefined;
};

export const shouldRefreshPortfolioBalancesForEvmAddress = (
  eventAddress: string | undefined,
  selectedEvmAddress: string | undefined,
): boolean => {
  if (!eventAddress || !selectedEvmAddress) {
    return false;
  }

  return eventAddress === selectedEvmAddress.trim().toLowerCase();
};

export const PortfolioEvmBalanceRefreshUtils = {
  PORTFOLIO_EVM_BALANCE_REFRESH_DEBOUNCE_MS,
  resolvePortfolioEvmBalanceRefreshAddress,
  shouldRefreshPortfolioBalancesForEvmAddress,
};
