import { NativeAndErc20Token } from '@popup/evm/interfaces/active-account.interface';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { EVMWalletInfoSectionActions } from '@popup/evm/pages/home/evm-wallet-info-section/evm-wallet-info-section-actions';
import { EvmTokenLogo } from '@popup/evm/pages/home/evm-token-logo/evm-token-logo.component';
import { ActionButton } from '@popup/hive/pages/app-container/home/hive-wallet-info-section/hive-wallet-info-section-actions';
import { navigateToWithParams } from '@popup/multichain/actions/navigation.actions';
import { RootState } from '@popup/multichain/store';
import React, { BaseSyntheticEvent, useEffect, useRef, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';
import { WalletInfoSectionItemButton } from 'src/common-ui/wallet-info-section-item-button/wallet-info-section-item-button.component';
import FormatUtils from 'src/utils/format.utils';

interface EVMWalletSectionInfoItemProps {
  token: NativeAndErc20Token;
  icon: SVGIcons;
  addBackground?: boolean;
  mainValue: string | number;
  mainValueLabel: string;
  mainValueSubLabel: string;
  subValue?: string | number;
  subValueLabel?: string;
}

export const WalletInfoSectionItem = ({
  token,
  icon,
  addBackground,
  mainValueSubLabel,
  mainValue,
  mainValueLabel,
  subValue,
  subValueLabel,
  navigateToWithParams,
}: PropsFromRedux) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [detailsId] = useState(
    () =>
      `evm-wallet-details-${token.tokenInfo.symbol.replace(
        /[^a-zA-Z0-9_-]/g,
        '-',
      )}`,
  );
  const [actionButtons, setActionButtons] = useState<ActionButton[]>([]);
  const reff = useRef<HTMLDivElement>(null);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    setActionButtons(EVMWalletInfoSectionActions(token));
  };

  const toggleDropdown = () => {
    setIsExpanded(!isExpanded);
    !process.env.IS_FIREFOX &&
      reff.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'center',
      });
  };

  const handleClick = (
    event: BaseSyntheticEvent,
    actionButton: ActionButton,
  ) => {
    event.stopPropagation();
    navigateToWithParams(
      actionButton.nextScreen,
      actionButton.nextScreenParams,
    );
  };

  return (
    <div
      className={`wallet-info-row ${isExpanded ? 'opened' : ''}`}
      ref={reff}>
      <button
        type="button"
        data-testid="wallet-info-section-row"
        className="information-panel"
        aria-expanded={isExpanded}
        aria-controls={detailsId}
        onClick={toggleDropdown}>
        {!(
          token.tokenInfo.type === EVMSmartContractType.ERC20 &&
          token.tokenInfo.lpV2
        ) && <EvmTokenLogo tokenInfo={token.tokenInfo} />}
        {token.tokenInfo.type === EVMSmartContractType.ERC20 &&
          token.tokenInfo.lpV2 && (
            <div className="currency-icon-container">
              <PreloadedImage
                src={token.tokenInfo.lpV2.token0.logo}
                className="currency-icon dual-icon"
                addBackground
                backgroundColor={token.tokenInfo.lpV2.token0.backgroundColor}
              />
              <PreloadedImage
                src={token.tokenInfo.lpV2.token1.logo}
                className="currency-icon dual-icon right-icon"
                addBackground
                backgroundColor={token.tokenInfo.lpV2.token1.backgroundColor}
              />
            </div>
          )}

        <div className="main-value-label">
          <div className="label">
            {mainValueLabel.length > 20
              ? `${mainValueLabel.slice(0, 20)}...`
              : mainValueLabel}
          </div>
          <div className="sub-label">
            {subValueLabel && subValueLabel.length > 20
              ? `${subValueLabel.slice(0, 20)}...`
              : subValueLabel}
          </div>
        </div>
        <div className="value">
          <div className="main-value">
            {mainValue.toString().length > 10
              ? `${mainValue.toString().slice(0, 10)}...`
              : mainValue}
          </div>
          {!!subValue &&
            parseFloat(FormatUtils.formatCurrencyValue(subValue)) !== 0 && (
              <div className="sub-value">
                {parseFloat(subValue?.toString()) > 0 ? '+' : ''}
                {FormatUtils.formatCurrencyValue(subValue)} ({subValueLabel})
              </div>
            )}
        </div>
      </button>
      {isExpanded && (
        <div id={detailsId} className="wallet-info-details">
          <div className="actions-panel">
            {actionButtons.map((ab, index) => (
              <WalletInfoSectionItemButton
                key={`action-${ab.label}-${index}`}
                actionButton={ab}
                handleClick={handleClick}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {
  navigateToWithParams,
});
type PropsFromRedux = ConnectedProps<typeof connector> &
  EVMWalletSectionInfoItemProps;

export const EVMWalletInfoSectionItemComponent = connector(
  WalletInfoSectionItem,
);
