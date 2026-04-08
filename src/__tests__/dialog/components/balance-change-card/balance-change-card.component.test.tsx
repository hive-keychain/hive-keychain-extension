import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { BalanceChangeCard } from 'src/dialog/components/balance-change-card/balance-change-card.component';

describe('BalanceChangeCard', () => {
  beforeEach(() => {
    chrome.i18n.getMessage = jest.fn(mocksImplementation.i18nGetMessageCustom);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders a single row when only mainBalance is provided', () => {
    const { container } = render(
      <BalanceChangeCard
        balanceInfo={{
          mainBalance: {
            symbol: 'ETH',
            before: '10 ETH',
            estimatedAfter: '8 ETH',
          },
        }}
      />,
    );

    expect(
      screen.getByText(chrome.i18n.getMessage('evm_balance_change_title')),
    ).toBeInTheDocument();
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
            symbol: 'ETH',
            before: '10 ETH',
            estimatedAfter: '8 ETH',
            insufficientBalance: false,
          },
          feeBalance: {
            symbol: 'ETH',
            before: '1 ETH',
            estimatedAfter: '0.9 ETH',
            insufficientBalance: true,
          },
        }}
      />,
    );

    expect(
      screen.getByText(chrome.i18n.getMessage('evm_balance_change_title')),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        chrome.i18n.getMessage('evm_insufficient_token_balance', ['ETH']),
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText('10 ETH')).not.toBeInTheDocument();
    expect(screen.queryByText('8 ETH')).not.toBeInTheDocument();
    expect(screen.queryByText('1 ETH')).not.toBeInTheDocument();
    expect(screen.queryByText('0.9 ETH')).not.toBeInTheDocument();
    expect(container.querySelectorAll('.balance-panel')).toHaveLength(0);
  });
});
