import { PortfolioLogoImage } from 'src/portfolio/ui/portfolio-logo-image.component';
import React from 'react';
import { PortfolioQuote } from 'src/portfolio/portfolio-api.interface';
import { PortfolioQuoteDisplayUtils } from 'src/portfolio/ui/portfolio-quote-display.utils';
import { I18nUtils } from 'src/utils/i18n.utils';

import './portfolio-quote-card.component.scss';

type Props = {
  quote: PortfolioQuote;
  isSelected: boolean;
  isExecutable?: boolean;
  onSelect: () => void;
};

export const PortfolioQuoteCard = ({
  quote,
  isSelected,
  isExecutable = true,
  onSelect,
}: Props) => {
  const detailRows = PortfolioQuoteDisplayUtils.getPortfolioQuoteDetailRows(quote);
  const providerLabel =
    quote.providerName ||
    PortfolioQuoteDisplayUtils.formatPortfolioQuoteEnumLabel(quote.provider);

  return (
    <div
      role="button"
      tabIndex={0}
      className={`portfolio-quote-card ${isSelected ? 'selected' : ''} ${
        isExecutable ? '' : 'not-executable'
      }`}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect();
        }
      }}>
      <div className="portfolio-quote-card__header">
        <div className="portfolio-quote-card__provider">
          <PortfolioLogoImage
            className="portfolio-quote-card__provider-logo"
            src={quote.providerLogoUrl}
            fallbackClassName="portfolio-quote-card__provider-fallback"
            fallbackLetter={providerLabel}
            colorKey={providerLabel}
          />
          <div className="portfolio-quote-card__provider-text">
            <strong>{providerLabel}</strong>
            {!isExecutable ? (
              <small>
                {I18nUtils.getMessage('portfolio_quote_not_executable')}
              </small>
            ) : null}
          </div>
        </div>
        <strong className="portfolio-quote-card__amount">
          {quote.estimatedToAmount}
        </strong>
      </div>

      {detailRows.length > 0 && (
        <dl className="portfolio-quote-card__details">
          {detailRows.map((row) => (
            <div key={row.key} className="portfolio-quote-card__detail-row">
              <dt>{I18nUtils.getMessage(row.labelKey)}</dt>
              <dd>
                {row.valueKey
                  ? I18nUtils.getMessage(row.valueKey)
                  : row.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
};
