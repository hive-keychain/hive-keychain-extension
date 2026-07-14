import { EvmTokenLogo } from '@popup/evm/pages/home/evm-token-logo/evm-token-logo.component';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import React from 'react';

interface Props {
  address: string;
  action: React.ReactNode;
  className?: string;
  container?: 'div' | 'li';
  contentClassName?: string;
  contentProps?: React.HTMLAttributes<HTMLDivElement>;
  dataTestId?: string;
  logo?: string;
  name?: string;
  symbol?: string;
}

const getTokenLabel = (address: string, name?: string, symbol?: string) => {
  const trimmedName = name?.trim() ?? '';
  const trimmedSymbol = symbol?.trim() ?? '';
  const fallbackLabel = EvmFormatUtils.formatAddress(address);

  return {
    logoName: trimmedName || trimmedSymbol || fallbackLabel,
    symbol: trimmedSymbol || trimmedName || fallbackLabel,
  };
};

export const EvmTokenListItemComponent = ({
  address,
  action,
  className = '',
  container: Container = 'div',
  contentClassName,
  contentProps,
  dataTestId,
  logo = '',
  name,
  symbol,
}: Props) => {
  const tokenLabel = getTokenLabel(address, name, symbol);
  const containerClassName = className.length
    ? `known-token-item ${className}`
    : 'known-token-item';
  const content = (
    <>
      <EvmTokenLogo
        tokenInfo={{
          logo,
          name: tokenLabel.logoName,
          symbol: tokenLabel.symbol,
        }}
      />
      <div className="known-token-details">
        <div className="known-token-main-row">
          <span className="known-token-symbol">{tokenLabel.symbol}</span>
        </div>
        <div className="known-token-address">
          {EvmFormatUtils.formatAddress(address)}
        </div>
      </div>
    </>
  );

  return (
    <Container className={containerClassName} data-testid={dataTestId}>
      {contentClassName ? (
        <div {...contentProps} className={contentClassName}>
          {content}
        </div>
      ) : (
        content
      )}
      {action}
    </Container>
  );
};
