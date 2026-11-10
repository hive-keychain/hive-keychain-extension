import React from 'react';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { PortfolioQuoteKyc } from 'src/portfolio/portfolio-api.interface';
import { I18nUtils } from 'src/utils/i18n.utils';

import './portfolio-kyc-chip.component.scss';

const kycLabelKeys: Record<PortfolioQuoteKyc, string> = {
  never: 'portfolio_quote_kyc_never',
  possible: 'portfolio_quote_kyc_possible',
  typically_required: 'portfolio_quote_kyc_typically_required',
};

const kycTooltipKeys: Partial<Record<PortfolioQuoteKyc, string>> = {
  possible: 'portfolio_quote_kyc_possible_tooltip',
};

type Props = {
  kyc: PortfolioQuoteKyc;
};

export const PortfolioKycChip = ({ kyc }: Props) => {
  const label = I18nUtils.getMessage(kycLabelKeys[kyc]);
  const tooltipKey = kycTooltipKeys[kyc];

  const chip = (
    <span
      className={`portfolio-kyc-chip portfolio-kyc-chip--${kyc}`}
      title={tooltipKey ? undefined : label}
      aria-label={label}
      data-testid="portfolio-kyc-chip"
      data-kyc={kyc}>
      {label}
      {tooltipKey ? (
        <SVGIcon
          className="portfolio-kyc-chip__info"
          icon={SVGIcons.GLOBAL_INFO}
          dataTestId="portfolio-kyc-chip-info"
        />
      ) : null}
    </span>
  );

  if (!tooltipKey) {
    return chip;
  }

  return (
    <CustomTooltip
      message={tooltipKey}
      position="top"
      additionalClassName="portfolio-kyc-chip__tooltip"
      dataTestId="portfolio-kyc-chip-tooltip">
      {chip}
    </CustomTooltip>
  );
};
