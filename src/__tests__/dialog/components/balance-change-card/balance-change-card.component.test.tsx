import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BalanceChangeCard } from 'src/dialog/components/balance-change-card/balance-change-card.component';

describe('BalanceChangeCard', () => {
  beforeEach(() => {
    chrome.i18n.getMessage = jest.fn((key: string) => key);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders main balance values and ignores fee balance', () => {
    render(
      <BalanceChangeCard
        balanceInfo={{
          mainBalance: {
            before: '10 ETH',
            estimatedAfter: '8 ETH',
            insufficientBalance: true,
          },
          feeBalance: {
            before: '1 ETH',
            estimatedAfter: '0.9 ETH',
            insufficientBalance: false,
          },
        }}
      />,
    );

    expect(screen.getByText('evm_balance_change_title')).toBeInTheDocument();
    expect(
      screen.getByText('insufficient_balance_warning'),
    ).toBeInTheDocument();
    expect(screen.getByText('10 ETH')).toBeInTheDocument();
    expect(screen.getByText('8 ETH')).toBeInTheDocument();
    expect(screen.queryByText('1 ETH')).not.toBeInTheDocument();
    expect(screen.queryByText('0.9 ETH')).not.toBeInTheDocument();
  });
});
