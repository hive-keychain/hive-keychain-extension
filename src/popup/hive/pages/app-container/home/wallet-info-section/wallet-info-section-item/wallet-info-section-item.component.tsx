import { ActionButton } from '@popup/hive/pages/app-container/home/wallet-info-section/wallet-info-section-actions';
import { WalletInfoSectionItemButton } from '@popup/hive/pages/app-container/home/wallet-info-section/wallet-info-section-item/wallet-info-section-item-button/wallet-info-section-item-button.component';
import { navigateToWithParams } from '@popup/multichain/actions/navigation.actions';
import { RootState } from '@popup/multichain/store';
import { Asset } from 'hive-keychain-commons';
import React, { BaseSyntheticEvent, Component, useRef, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import FormatUtils from 'src/utils/format.utils';

interface WalletSectionInfoItemProps {
  iconName: SVGIcons;
  icon?: Element;
  addBackground?: boolean;
  mainValue: string | Asset | number;
  mainValueLabel: string;
  subValue?: string | Asset | number;
  subValueLabel?: string;
  hasButtonsInList?: boolean;
  tokenInfo: Component;
  actionButtons: ActionButton[];
  onHistoryClick: () => void;
}

const walletInfoSectionItem = ({
  icon,
  iconName,
  addBackground,
  mainValue,
  mainValueLabel,
  subValue,
  subValueLabel,
  navigateToWithParams,
  onHistoryClick,
  actionButtons,
  tokenInfo,
}: PropsFromRedux & WalletSectionInfoItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const reff = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsExpanded(!isExpanded);
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

  const handleHistoryClick = (event: BaseSyntheticEvent) => {
    event.stopPropagation();
    onHistoryClick();
  };

  return (
    <div
      className={`wallet-info-row ${isExpanded ? 'opened' : ''}`}
      data-testid={`wallet-info-section-row`}
      ref={reff}
      onClick={() => {
        toggleDropdown();
        !process.env.IS_FIREFOX &&
          reff.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'center',
          });
      }}>
      <div className="information-panel">
        {!icon ? (
          <SVGIcon
            icon={iconName}
            className={`currency-icon ${addBackground ? 'add-background' : ''}`}
          />
        ) : (
          icon
        )}

        <div className="main-value-label">{mainValueLabel}</div>
        <div className="value">
          <div className="main-value">
            {FormatUtils.formatCurrencyValue(mainValue)}
          </div>
          {!!subValue &&
            parseFloat(FormatUtils.formatCurrencyValue(subValue)) !== 0 && (
              <div className="sub-value">
                {parseFloat(subValue?.toString()) > 0 ? '+' : ''}
                {FormatUtils.formatCurrencyValue(subValue)} ({subValueLabel})
              </div>
            )}
        </div>
        {isExpanded && (
          <SVGIcon
            icon={SVGIcons.WALLET_HISTORY_BUTTON}
            className={`history-icon`}
            onClick={($event) => handleHistoryClick($event)}
            hoverable
          />
        )}
      </div>
      {isExpanded && (
        <>
          {tokenInfo}
          <div className="actions-panel">
            {actionButtons.map((ab, index) => (
              <WalletInfoSectionItemButton
                key={`action-${ab.label}-${index}`}
                actionButton={ab}
                handleClick={handleClick}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    globalProperties: state.hive.globalProperties,
  };
};

const connector = connect(mapStateToProps, {
  navigateToWithParams,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const WalletInfoSectionItemComponent = connector(walletInfoSectionItem);
