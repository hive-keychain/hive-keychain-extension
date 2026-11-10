import { EvmTokenLogo } from '@popup/evm/pages/home/evm-token-logo/evm-token-logo.component';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import React from 'react';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import {
  COPY_GENERIC_MESSAGE_KEY,
  copyTextWithToast,
} from 'src/common-ui/toast/copy-toast.utils';
import { I18nUtils } from 'src/utils/i18n.utils';

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
  const copyContractAddress = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    void copyTextWithToast(address, COPY_GENERIC_MESSAGE_KEY);
  };
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
        <div className="known-token-address-row">
          <CustomTooltip
            message={address}
            skipTranslation
            additionalClassName="known-token-address-tooltip evm-address-tooltip"
            dataTestId={`token-address-${address}`}>
            <span className="known-token-address">
              {EvmFormatUtils.formatAddress(address)}
            </span>
          </CustomTooltip>
          <button
            type="button"
            className="known-token-copy-button"
            aria-label={I18nUtils.getMessage('html_popup_copy')}
            data-testid={`token-contract-address-${address}`}
            onClick={copyContractAddress}
            onKeyDown={(event) => event.stopPropagation()}>
            <SVGIcon icon={SVGIcons.SELECT_COPY} />
          </button>
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
