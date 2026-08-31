import React, { useState } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import {
  PortfolioCanonicalAsset,
  PortfolioHistoryItem,
} from 'src/portfolio/portfolio-api.interface';
import { PortfolioHistoryDisplayUtils } from 'src/portfolio/ui/portfolio-history-display.utils';
import { PortfolioLogoImage } from 'src/portfolio/ui/portfolio-logo-image.component';
import { I18nUtils } from 'src/utils/i18n.utils';

import './portfolio-compliance-review-banner.component.scss';

export interface PortfolioComplianceReviewBannerProps {
  items: PortfolioHistoryItem[];
  fromAssetsByItemId: Record<string, PortfolioCanonicalAsset | undefined>;
  toAssetsByItemId: Record<string, PortfolioCanonicalAsset | undefined>;
  isCompact?: boolean;
  onViewHistory: () => void;
}

const resolveProviderLabel = (item: PortfolioHistoryItem): string =>
  item.providerName?.trim() || item.provider.replace(/_/g, ' ');

const resolveItemAmountSummary = (
  item: PortfolioHistoryItem,
  fromAsset: PortfolioCanonicalAsset | undefined,
  toAsset: PortfolioCanonicalAsset | undefined,
): string => {
  const fromSymbol = PortfolioHistoryDisplayUtils.getPortfolioHistoryAssetSymbol(
    item.fromAssetId,
    fromAsset,
    item.fromAssetId ? null : item.fiatCurrency,
  );
  const toSymbol = PortfolioHistoryDisplayUtils.getPortfolioHistoryAssetSymbol(
    item.toAssetId,
    toAsset,
    item.toAssetId ? null : item.fiatCurrency,
  );
  const fromAmount = PortfolioHistoryDisplayUtils.formatPortfolioHistoryAmount(
    item.fromAmount,
  );
  const toAmount = PortfolioHistoryDisplayUtils.formatPortfolioHistoryAmount(
    PortfolioHistoryDisplayUtils.resolvePortfolioHistoryDisplayToAmount(item),
  );

  if (fromAmount && toAmount) {
    return `${fromAmount} ${fromSymbol} → ${toAmount} ${toSymbol}`;
  }

  if (fromAmount) {
    return `${fromAmount} ${fromSymbol}`;
  }

  if (toAmount) {
    return `${toAmount} ${toSymbol}`;
  }

  return '';
};

export const PortfolioComplianceReviewBanner = ({
  items,
  fromAssetsByItemId,
  toAssetsByItemId,
  isCompact = false,
  onViewHistory,
}: PortfolioComplianceReviewBannerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (items.length === 0) {
    return null;
  }

  const summaryLabel = I18nUtils.getMessage(
    'portfolio_compliance_review_banner_summary',
    [String(items.length)],
  );

  return (
    <div
      className={`portfolio-compliance-review-banner${
        isCompact ? ' portfolio-compliance-review-banner--compact' : ''
      }`}
      data-testid="portfolio-compliance-review-banner">
      <button
        type="button"
        className="portfolio-compliance-review-banner__summary"
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded((previous) => !previous)}>
        <SVGIcon
          icon={SVGIcons.SWAPS_STATUS_WARNING}
          className="portfolio-compliance-review-banner__icon"
        />
        <span className="portfolio-compliance-review-banner__summary-text">
          {summaryLabel}
        </span>
        <SVGIcon
          icon={SVGIcons.WALLET_HISTORY_EXPAND_COLLAPSE}
          className={`portfolio-compliance-review-banner__chevron ${
            isExpanded ? 'open' : 'closed'
          }`}
        />
      </button>

      {isExpanded ? (
        <div className="portfolio-compliance-review-banner__details">
          <p className="portfolio-compliance-review-banner__explanation">
            {I18nUtils.getMessage('portfolio_compliance_review_banner_explanation')}
          </p>
          <div className="portfolio-compliance-review-banner__items">
            {items.map((item) => {
              const fromAsset = fromAssetsByItemId[item.id];
              const toAsset = toAssetsByItemId[item.id];
              const providerLabel = resolveProviderLabel(item);
              const amountSummary = resolveItemAmountSummary(
                item,
                fromAsset,
                toAsset,
              );
              const supportActionUrl =
                PortfolioHistoryDisplayUtils.resolvePortfolioHistorySupportActionUrl(
                  item,
                );
              const fromSymbol =
                PortfolioHistoryDisplayUtils.getPortfolioHistoryAssetSymbol(
                  item.fromAssetId,
                  fromAsset,
                  item.fromAssetId ? null : item.fiatCurrency,
                );
              const toSymbol =
                PortfolioHistoryDisplayUtils.getPortfolioHistoryAssetSymbol(
                  item.toAssetId,
                  toAsset,
                  item.toAssetId ? null : item.fiatCurrency,
                );

              return (
                <div
                  key={item.id}
                  className="portfolio-compliance-review-banner__item">
                  <div className="portfolio-compliance-review-banner__item-header">
                    <span className="portfolio-compliance-review-banner__item-provider">
                      {item.providerLogoUrl ? (
                        <PortfolioLogoImage
                          className="portfolio-compliance-review-banner__item-provider-logo"
                          src={item.providerLogoUrl}
                        />
                      ) : null}
                      <span className="portfolio-compliance-review-banner__item-provider-label">
                        {providerLabel}
                      </span>
                    </span>
                  </div>
                  {amountSummary ? (
                    <div className="portfolio-compliance-review-banner__item-amounts">
                      {amountSummary}
                    </div>
                  ) : null}
                  {item.providerReferenceId ? (
                    <div className="portfolio-compliance-review-banner__item-meta">
                      {I18nUtils.getMessage('portfolio_history_exchange_id')}:{' '}
                      {item.providerReferenceId}
                    </div>
                  ) : null}
                  {supportActionUrl ? (
                    <div className="portfolio-compliance-review-banner__item-actions">
                      <button
                        type="button"
                        className="portfolio-compliance-review-banner__action-link portfolio-compliance-review-banner__action-link--primary"
                        onClick={() => {
                          PortfolioHistoryDisplayUtils.openPortfolioHistorySupportUrl(
                            supportActionUrl,
                            {
                              item,
                              fromSymbol,
                              toSymbol,
                            },
                          );
                        }}>
                        {I18nUtils.getMessage('portfolio_history_contact_provider')}
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
          <button
            type="button"
            className="portfolio-compliance-review-banner__view-history"
            onClick={onViewHistory}>
            {I18nUtils.getMessage('portfolio_compliance_review_banner_view_history')}
          </button>
        </div>
      ) : null}
    </div>
  );
};
