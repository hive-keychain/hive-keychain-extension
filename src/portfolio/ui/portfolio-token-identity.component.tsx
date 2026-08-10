import { ChainLogo } from '@common-ui/chain-logo/chain-logo.component';
import { SVGIcon } from '@common-ui/svg-icon/svg-icon.component';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import React from 'react';
import {
  PortfolioCanonicalAsset,
  PortfolioChainDisplayRecord,
} from 'src/portfolio/portfolio-api.interface';
import {
  PortfolioFlowRow,
  PortfolioFlowUtils,
} from 'src/portfolio/portfolio-flow.utils';
import { PortfolioLogoImage } from 'src/portfolio/ui/portfolio-logo-image.component';

import './portfolio-token-identity.component.scss';

export type PortfolioTokenIdentityProps = {
  symbol: string;
  network?: string;
  logoUrl?: string | null;
  networkLogoUrl?: string | null;
  isHive?: boolean;
  balance?: string;
  /** Full avatar fallback (e.g. fiat narrow symbol). Defaults to the first letter of symbol. */
  avatarFallback?: string;
};

export const PortfolioTokenIdentity = React.memo(({
  symbol,
  network = '',
  logoUrl,
  networkLogoUrl,
  isHive = false,
  balance,
  avatarFallback,
}: PortfolioTokenIdentityProps) => {
  const displaySymbol = symbol.toUpperCase();
  const hiveIcon = isHive
    ? PortfolioFlowUtils.getHiveTokenIcon(displaySymbol)
    : undefined;

  return (
    <div className="portfolio-token-identity">
      <div className="portfolio-token-logo-wrap">
        {hiveIcon ? (
          <SVGIcon icon={hiveIcon} className="currency-icon" />
        ) : (
          <PortfolioLogoImage
            src={logoUrl}
            className="currency-icon"
            fallbackClassName="portfolio-token-avatar"
            fallbackLetter={displaySymbol}
            fallbackText={avatarFallback}
            colorKey={displaySymbol}
          />
        )}
        {networkLogoUrl || network ? (
          <ChainLogo
            chainName={network}
            logoUri={networkLogoUrl}
            className="portfolio-network-badge"
          />
        ) : null}
      </div>
      <span className="portfolio-token-identity__text">
        <strong>{displaySymbol}</strong>
        {network ? <small>{network}</small> : null}
      </span>
      {balance ? (
        <span className="portfolio-token-identity__balance">{balance}</span>
      ) : null}
    </div>
  );
});

PortfolioTokenIdentity.displayName = 'PortfolioTokenIdentity';

export const portfolioRowToTokenIdentityProps = (
  row: PortfolioFlowRow,
): PortfolioTokenIdentityProps => ({
  symbol: row.symbol,
  network: row.network,
  logoUrl: row.logoUrl,
  networkLogoUrl:
    row.networkLogoUrl ??
    (row.isHive || row.key.startsWith('hive:')
      ? PortfolioFlowUtils.resolveHivePortfolioRowNetworkLogoUrl(row.symbol)
      : null),
  isHive: row.isHive,
});

export const canonicalAssetToTokenIdentityProps = (
  asset: PortfolioCanonicalAsset,
  chains: EvmChain[] = [],
  portfolioChains: PortfolioChainDisplayRecord = {},
): PortfolioTokenIdentityProps => ({
  symbol: asset.symbol,
  network: PortfolioFlowUtils.resolveCanonicalAssetNetworkLabel(
    asset,
    chains,
    portfolioChains,
  ),
  logoUrl: asset.logoUrl,
  networkLogoUrl: PortfolioFlowUtils.resolveCanonicalAssetNetworkLogoUrl(
    asset,
    chains,
    portfolioChains,
  ),
  isHive: asset.ecosystem === 'hive' || asset.ecosystem === 'hive_engine',
});
