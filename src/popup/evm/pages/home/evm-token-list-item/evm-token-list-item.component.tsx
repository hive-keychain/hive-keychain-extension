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
  isActivateDisabled?: boolean;
  logo?: string;
  name?: string;
  /** Makes the whole row activate this callback (keyboard + click). */
  onActivate?: () => void;
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
  isActivateDisabled = false,
  logo = '',
  name,
  onActivate,
  symbol,
}: Props) => {
  const tokenLabel = getTokenLabel(address, name, symbol);
  const isRowActivatable = Boolean(onActivate) && !isActivateDisabled;
  const containerClassName = [
    'known-token-item',
    className,
    onActivate ? 'known-token-item--clickable' : '',
    isActivateDisabled ? 'known-token-item--disabled' : '',
  ]
    .filter(Boolean)
    .join(' ');
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

  const handleActivate = () => {
    if (!isRowActivatable) {
      return;
    }
    onActivate?.();
  };

  return (
    <Container
      className={containerClassName}
      data-testid={dataTestId}
      role={onActivate ? 'button' : undefined}
      tabIndex={isRowActivatable ? 0 : undefined}
      aria-disabled={onActivate ? isActivateDisabled : undefined}
      onClick={onActivate ? handleActivate : undefined}
      onKeyDown={
        onActivate
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleActivate();
              }
            }
          : undefined
      }>
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
