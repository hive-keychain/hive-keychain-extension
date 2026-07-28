import React from 'react';
import { PortfolioLogoImage } from 'src/portfolio/ui/portfolio-logo-image.component';

type Props = {
  label: string;
  logoUrl?: string | null;
  className?: string;
};

export const PortfolioProviderValue = ({
  label,
  logoUrl,
  className = 'portfolio-confirmation-provider',
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
  </span>
);
