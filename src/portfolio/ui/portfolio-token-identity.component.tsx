import { ChainLogo } from '@common-ui/chain-logo/chain-logo.component';
import { PreloadedImage } from '@common-ui/preloaded-image/preloaded-image.component';
import { SVGIcon } from '@common-ui/svg-icon/svg-icon.component';
import React, { useEffect, useState } from 'react';
import { PortfolioCanonicalAsset } from 'src/portfolio/portfolio-api.interface';
import {
  PortfolioFlowRow,
  PortfolioFlowUtils,
} from 'src/portfolio/portfolio-flow.utils';
import { ColorsUtils } from 'src/utils/colors.utils';

import './portfolio-token-identity.component.scss';

export type PortfolioTokenIdentityProps = {
  symbol: string;
  network?: string;
  logoUrl?: string | null;
  networkLogoUrl?: string | null;
  isHive?: boolean;
  balance?: string;
};

export const PortfolioTokenIdentity = ({
  symbol,
  network = '',
  logoUrl,
  networkLogoUrl,
  isHive = false,
  balance,
}: PortfolioTokenIdentityProps) => {
  const [color, setColor] = useState<string>();

  useEffect(() => {
    setColor(ColorsUtils.stringToColor(symbol));
  }, [symbol]);

  const hiveIcon = isHive ? PortfolioFlowUtils.getHiveTokenIcon(symbol) : undefined;

  return (
    <div className="portfolio-token-identity">
      <div className="portfolio-token-logo-wrap">
        {hiveIcon ? (
          <SVGIcon icon={hiveIcon} className="currency-icon" />
        ) : logoUrl ? (
          <PreloadedImage
            className="currency-icon"
            src={logoUrl}
            alt=""
            placeholder="/assets/images/wallet/hive-engine.svg"
          />
        ) : (
          <span
            className="portfolio-token-avatar"
            style={{
              backgroundColor: `${color}2b`,
              color,
            }}>
            {symbol.slice(0, 1)}
          </span>
        )}
        {networkLogoUrl ? (
          <ChainLogo
            chainName={network}
            logoUri={networkLogoUrl}
            className="portfolio-network-badge"
          />
        ) : null}
      </div>
      <span className="portfolio-token-identity__text">
        <strong>{symbol}</strong>
        {network ? <small>{network}</small> : null}
      </span>
      {balance ? (
        <span className="portfolio-token-identity__balance">{balance}</span>
      ) : null}
    </div>
  );
};

export const portfolioRowToTokenIdentityProps = (
  row: PortfolioFlowRow,
): PortfolioTokenIdentityProps => ({
  symbol: row.symbol,
  network: row.network,
  logoUrl: row.logoUrl,
  networkLogoUrl: row.networkLogoUrl,
  isHive: row.isHive,
});

export const canonicalAssetToTokenIdentityProps = (
  asset: PortfolioCanonicalAsset,
  networkLogoUrl?: string | null,
): PortfolioTokenIdentityProps => ({
  symbol: asset.symbol,
  network: asset.name,
  logoUrl: asset.logoUrl,
  networkLogoUrl:
    asset.ecosystem === 'evm' ? (networkLogoUrl ?? null) : null,
  isHive: asset.ecosystem === 'hive' || asset.ecosystem === 'hive_engine',
});
