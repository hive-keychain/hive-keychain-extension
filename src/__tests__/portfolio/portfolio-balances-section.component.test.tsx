import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { PortfolioBalancesSection } from 'src/portfolio/ui/portfolio-balances-section.component';

describe('PortfolioBalancesSection', () => {
  const baseProps = {
    hasAccounts: true,
    selectedAccountKey: 'evm:0xabc',
    isHiveAccount: false,
    showNetworkFilter: false,
    accountOptions: [{ value: 'evm:0xabc', label: '0xabc' }],
    networkOptions: [{ value: '', label: 'All networks' }],
    selectedNetwork: '',
    tokenFilter: '',
    expandedRowKeys: [] as string[],
    rowActions: ['swap' as const],
    isLoadingMoreChains: false,
    onSelectedAccountChange: jest.fn(),
    onSelectedNetworkChange: jest.fn(),
    onTokenFilterChange: jest.fn(),
    onToggleRowExpanded: jest.fn(),
    onOpenFlowForRow: jest.fn(),
    renderAccountOption: () => '0xabc',
    renderNetworkOption: () => 'All networks',
  };

  it('filters visible rows by token filter and renders totals', () => {
    const { container, rerender } = render(
      <PortfolioBalancesSection
        {...baseProps}
        rows={[
          {
            key: 'eth',
            symbol: 'ETH',
            network: 'Ethereum',
            balance: '1',
            usdValue: 100,
            priceUsd: 100,
          },
          {
            key: 'matic',
            symbol: 'MATIC',
            network: 'Polygon',
            balance: '10',
            usdValue: 10,
            priceUsd: 1,
          },
        ]}
      />,
    );

    expect(container.textContent).toContain('ETH');
    expect(container.textContent).toContain('MATIC');
    expect(container.textContent).toContain('$110.00');

    rerender(
      <PortfolioBalancesSection
        {...baseProps}
        tokenFilter="matic"
        rows={[
          {
            key: 'eth',
            symbol: 'ETH',
            network: 'Ethereum',
            balance: '1',
            usdValue: 100,
            priceUsd: 100,
          },
          {
            key: 'matic',
            symbol: 'MATIC',
            network: 'Polygon',
            balance: '10',
            usdValue: 10,
            priceUsd: 1,
          },
        ]}
      />,
    );

    expect(container.textContent).toContain('MATIC');
    expect(container.textContent).not.toContain('Ethereum');
    expect(container.textContent).toContain('$10.00');
  });

  it('invokes onOpenFlowForRow from row actions', () => {
    const onOpenFlowForRow = jest.fn();
    const row = {
      key: 'eth',
      symbol: 'ETH',
      network: 'Ethereum',
      balance: '1',
      usdValue: 100,
      priceUsd: 100,
    };

    const { container } = render(
      <PortfolioBalancesSection
        {...baseProps}
        rows={[row]}
        onOpenFlowForRow={onOpenFlowForRow}
      />,
    );

    fireEvent.click(
      container.querySelector(
        '.portfolio-row-actions button',
      ) as HTMLButtonElement,
    );

    expect(onOpenFlowForRow).toHaveBeenCalledWith(row, 'swap');
  });
});
