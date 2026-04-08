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

  it('renders a single row when only mainBalance is provided', () => {
    const { container } = render(
      <BalanceChangeCard
        balanceInfo={{
          mainBalance: {
            before: '10 ETH',
            estimatedAfter: '8 ETH',
          },
        }}
      />,
    );

    expect(screen.getByText('evm_balance_change_title')).toBeInTheDocument();
    expect(screen.getByText('10 ETH')).toBeInTheDocument();
    expect(screen.getByText('8 ETH')).toBeInTheDocument();
    expect(
      screen.queryByText('insufficient_balance_warning'),
    ).not.toBeInTheDocument();
    expect(container.querySelectorAll('.balance-panel')).toHaveLength(1);
  });

  it('renders a second fee row and warns when any row is insufficient', () => {
    const { container } = render(
      <BalanceChangeCard
        balanceInfo={{
          mainBalance: {
            before: '10 ETH',
            estimatedAfter: '8 ETH',
            insufficientBalance: false,
          },
          feeBalance: {
            before: '1 ETH',
            estimatedAfter: '0.9 ETH',
            insufficientBalance: true,
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
    expect(screen.getByText('1 ETH')).toBeInTheDocument();
    expect(screen.getByText('0.9 ETH')).toBeInTheDocument();
    expect(container.querySelectorAll('.balance-panel')).toHaveLength(2);
  });
});
