import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import {
  PortfolioEvmBalanceRefreshUtils,
  resolvePortfolioEvmBalanceRefreshAddress,
  shouldRefreshPortfolioBalancesForEvmAddress,
} from 'src/portfolio/portfolio-evm-balance-refresh.utils';

describe('PortfolioEvmBalanceRefreshUtils', () => {
  it('resolves the sender address from a resolved transaction message', () => {
    expect(
      resolvePortfolioEvmBalanceRefreshAddress({
        command: BackgroundCommand.EVM_TRANSACTION_RESOLVED,
        value: { from: '0xAbC' },
      }),
    ).toBe('0xabc');
  });

  it('resolves the address from an incoming transaction message', () => {
    expect(
      resolvePortfolioEvmBalanceRefreshAddress({
        command: BackgroundCommand.EVM_INCOMING_TRANSACTION,
        value: { address: '0xDeF' },
      }),
    ).toBe('0xdef');
  });

  it('returns undefined for unrelated messages', () => {
    expect(
      resolvePortfolioEvmBalanceRefreshAddress({
        command: BackgroundCommand.PING,
        value: { from: '0xabc' },
      }),
    ).toBeUndefined();
  });

  it('matches selected EVM addresses case-insensitively', () => {
    expect(
      shouldRefreshPortfolioBalancesForEvmAddress('0xabc', '0xAbC'),
    ).toBe(true);
    expect(
      shouldRefreshPortfolioBalancesForEvmAddress('0xabc', '0xdef'),
    ).toBe(false);
    expect(
      shouldRefreshPortfolioBalancesForEvmAddress(undefined, '0xabc'),
    ).toBe(false);
  });

  it('exposes the shared debounce delay', () => {
    expect(
      PortfolioEvmBalanceRefreshUtils.PORTFOLIO_EVM_BALANCE_REFRESH_DEBOUNCE_MS,
    ).toBe(1500);
  });
});
