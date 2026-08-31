import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { PortfolioHistoryItem } from 'src/portfolio/portfolio-api.interface';
import { PortfolioComplianceReviewBanner } from 'src/portfolio/ui/portfolio-compliance-review-banner.component';
import { PortfolioHistoryDisplayUtils } from 'src/portfolio/ui/portfolio-history-display.utils';
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
  id: 'exec-compliance',
  status: 'awaiting_compliance_action',
  displayStatus: 'verification_required',
  mode: 'swap',
  provider: 'changelly',
  providerReferenceId: 'swap-123',
  fromAssetId: 'evm:native:ethereum',
  toAssetId: 'evm:token:ethereum:0xusdc',
  fromAmount: '2.15',
  toAmount: '6764.9',
  receivedAmount: null,
  fromAddress: '0xabc',
  toAddress: '0xdef',
  redirectUrl: null,
  transaction: null,
  fiatCurrency: null,
  paymentMethod: null,
  submittedAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  executionType: 'redirect',
  txHash: null,
  providerName: 'Changelly',
  providerLogoUrl: null,
  providerStatus: 'hold',
  lastProviderStatusRefreshAt: null,
  failureCode: 'aml_review',
  failureAction: 'contact_support',
  providerStatusDetail: null,
  providerStatusUrl: null,
  supportUrl: 'mailto:security@changelly.com',
  ...overrides,
});

describe('PortfolioComplianceReviewBanner', () => {
  beforeEach(() => {
    jest.spyOn(I18nUtils, 'getMessage').mockImplementation((key: string) => key);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders nothing when there are no compliance items', () => {
    const { container } = render(
      <PortfolioComplianceReviewBanner
        items={[]}
        fromAssetsByItemId={{}}
        toAssetsByItemId={{}}
        onViewHistory={jest.fn()}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('expands to show compliance details and contact actions', () => {
    const onViewHistory = jest.fn();
    const openSupportUrlSpy = jest
      .spyOn(PortfolioHistoryDisplayUtils, 'openPortfolioHistorySupportUrl')
      .mockImplementation(() => undefined);

    const { container, getByText } = render(
      <PortfolioComplianceReviewBanner
        items={[createHistoryItem()]}
        fromAssetsByItemId={{
          'exec-compliance': {
            assetId: 'evm:native:ethereum',
            ecosystem: 'evm',
            symbol: 'ETH',
            name: 'Ether',
            chainId: 'ethereum',
            address: null,
            decimals: 18,
            isNative: true,
            familyId: 'eth',
            logoUrl: null,
            priceUsd: 0,
            rankScore: 0,
          },
        }}
        toAssetsByItemId={{
          'exec-compliance': {
            assetId: 'evm:token:ethereum:0xusdc',
            ecosystem: 'evm',
            symbol: 'USDC',
            name: 'USD Coin',
            chainId: 'ethereum',
            address: '0xusdc',
            decimals: 6,
            isNative: false,
            familyId: 'usdc',
            logoUrl: null,
            priceUsd: 0,
            rankScore: 0,
          },
        }}
        onViewHistory={onViewHistory}
      />,
    );

    fireEvent.click(
      container.querySelector(
        '.portfolio-compliance-review-banner__summary',
      ) as Element,
    );

    expect(
      getByText('portfolio_compliance_review_banner_explanation'),
    ).not.toBeNull();
    expect(getByText('portfolio_history_contact_provider')).not.toBeNull();

    fireEvent.click(getByText('portfolio_history_contact_provider'));
    expect(openSupportUrlSpy).toHaveBeenCalledWith(
      'mailto:security@changelly.com',
      expect.objectContaining({
        item: expect.objectContaining({ id: 'exec-compliance' }),
      }),
    );

    fireEvent.click(
      getByText('portfolio_compliance_review_banner_view_history'),
    );
    expect(onViewHistory).toHaveBeenCalled();

    openSupportUrlSpy.mockRestore();
  });
});
