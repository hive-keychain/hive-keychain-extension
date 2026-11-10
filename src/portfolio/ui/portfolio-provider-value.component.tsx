import React from 'react';
import { PortfolioQuoteKyc } from 'src/portfolio/portfolio-api.interface';
import { PortfolioKycChip } from 'src/portfolio/ui/portfolio-kyc-chip.component';
import { PortfolioLogoImage } from 'src/portfolio/ui/portfolio-logo-image.component';

type Props = {
  label: string;
  logoUrl?: string | null;
  className?: string;
  kyc?: PortfolioQuoteKyc;
};

export const PortfolioProviderValue = ({
  label,
  logoUrl,
  className = 'portfolio-confirmation-provider',
  kyc = 'never',
}: Props) => (
  <span className={className}>
    <PortfolioLogoImage
      className={`${className}__logo`}
      src={logoUrl}
      fallbackClassName={`${className}__fallback`}
      fallbackLetter={label}
      colorKey={label}
    />
    <span className={`${className}__label`}>{label}</span>
    <PortfolioKycChip kyc={kyc} />
  </span>
);
