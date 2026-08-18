import { render } from '@testing-library/react';
import React from 'react';
import { PortfolioCanonicalAsset, PortfolioHistoryItem } from 'src/portfolio/portfolio-api.interface';
import { PortfolioHistoryCard } from 'src/portfolio/ui/portfolio-history-card.component';
import { I18nUtils } from 'src/utils/i18n.utils';

jest.mock('react-svg', () => ({
  ReactSVG: ({
    afterInjection,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & { afterInjection?: unknown }) => (
    <div {...props} />
  ),
}));

const createHistoryItem = (
  overrides: Partial<PortfolioHistoryItem> = {},
): PortfolioHistoryItem => ({
  id: 'history-1',
  status: 'completed',
  displayStatus: 'completed',
  mode: 'swap',
  provider: 'lifi',
  providerReferenceId: null,
  fromAssetId: 'evm:token:ethereum:0xusdc',
  toAssetId: 'evm:native:ethereum',
  fromAmount: '20.28',
  toAmount: '0.00656',
  receivedAmount: '0.00656',
  fromAddress: '0xabc',
  toAddress: '0xabc',
  redirectUrl: null,
  transaction: null,
  fiatCurrency: null,
  paymentMethod: null,
  submittedAt: '2026-08-18T10:00:00.000Z',
  updatedAt: '2026-08-18T10:01:00.000Z',
  executionType: 'in_app',
  txHash: null,
  providerName: 'LI.FI',
  providerLogoUrl: null,
  providerStatus: 'completed',
  lastProviderStatusRefreshAt: null,
  failureCode: null,
  failureAction: null,
  providerStatusDetail: null,
  providerStatusUrl: null,
  supportUrl: null,
  ...overrides,
});

const createAsset = (
  overrides: Partial<PortfolioCanonicalAsset> = {},
): PortfolioCanonicalAsset => ({
  assetId: 'evm:token:ethereum:0xusdc',
  ecosystem: 'evm',
  symbol: 'USDC',
  name: 'USD Coin',
  chainId: 'ethereum',
  address: '0xusdc',
  decimals: 6,
  isNative: false,
  familyId: 'usdc',
  logoUrl: 'https://example.com/usdc.png',
  priceUsd: 1,
  rankScore: 1,
  ...overrides,
});

describe('PortfolioHistoryCard', () => {
  beforeEach(() => {
    jest.spyOn(I18nUtils, 'getMessage').mockImplementation((key: string) => key);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('keeps from and to labels, amounts, and identities on shared rows', () => {
    const { container } = render(
      <PortfolioHistoryCard
        item={createHistoryItem()}
        fromAsset={createAsset()}
        toAsset={createAsset({
          assetId: 'evm:native:ethereum',
          symbol: 'ETH',
          name: 'Ether',
          address: null,
          isNative: true,
          familyId: 'eth',
          logoUrl: 'https://example.com/eth.png',
        })}
        chains={[]}
      />,
    );

    expect(
      container.querySelector('.portfolio-history-card__leg-label--from'),
    ).not.toBeNull();
    expect(
      container.querySelector('.portfolio-history-card__leg-label--to'),
    ).not.toBeNull();
    expect(
      container.querySelector('.portfolio-history-card__leg-amount--from')
        ?.textContent,
    ).toContain('20.28');
    expect(
      container.querySelector('.portfolio-history-card__leg-amount--to')
        ?.textContent,
    ).toContain('0.00656');
    expect(
      container.querySelectorAll('.portfolio-history-card__leg-identity').length,
    ).toBe(2);
  });

  it('reserves the amount row when one leg has no amount', () => {
    const { container } = render(
      <PortfolioHistoryCard
        item={createHistoryItem({
          fromAssetId: null,
          fromAmount: null,
          fiatCurrency: 'USD',
        })}
        toAsset={createAsset({
          assetId: 'evm:native:ethereum',
          symbol: 'ETH',
          name: 'Ether',
          address: null,
          isNative: true,
          familyId: 'eth',
        })}
        chains={[]}
      />,
    );

    const fromAmount = container.querySelector(
      '.portfolio-history-card__leg-amount--from',
    );
    const toAmount = container.querySelector(
      '.portfolio-history-card__leg-amount--to',
    );

    expect(fromAmount).not.toBeNull();
    expect(fromAmount?.textContent).toBe('\u00a0');
    expect(toAmount?.textContent).toContain('0.00656');
  });
});
