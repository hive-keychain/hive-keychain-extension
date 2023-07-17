import { Asset } from '@hiveio/dhive';
import { Token, TokenBalance } from '@interfaces/tokens.interface';
import { navigateToWithParams } from '@popup/hive/actions/navigation.actions';
import {
  ActionButton,
  WalletInfoSectionActions,
} from '@popup/hive/pages/app-container/home/wallet-info-section/wallet-info-section-actions';
import React, { BaseSyntheticEvent, useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { IconType } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { RootState } from 'src/popup/hive/store';
import FormatUtils from 'src/utils/format.utils';
import './wallet-info-section-item.component.scss';

interface WalletSectionInfoItemProps {
  tokenSymbol: string;
  tokenInfo?: Token;
  tokenBalance?: TokenBalance;
  icon: IconType;
  iconColor?: 'red' | 'green';
  mainValue: string | Asset | number;
  mainValueLabel: string;
  subValue?: string | Asset | number;
  subValueLabel?: string;
}

const walletInfoSectionItem = ({
  tokenSymbol,
  tokenInfo,
  tokenBalance,
  icon,
  iconColor,
  mainValue,
  mainValueLabel,
  subValue,
  subValueLabel,
  navigateToWithParams,
}: PropsFromRedux) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [actionButtons, setActionButtons] = useState<ActionButton[]>([]);

  useEffect(() => {
    setActionButtons(
      WalletInfoSectionActions(tokenSymbol, tokenInfo, tokenBalance),
    );
  }, []);

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

  return (
    <div
      className={`wallet-info-row ${isExpanded ? 'opened' : ''}`}
      data-testid={`wallet-info-section-row`}
      onClick={() => toggleDropdown()}>
      <div className="information-panel">
        <SVGIcon icon={icon} className={`currency-icon ${iconColor ?? ''}`} />
        <div className="main-value-label">{mainValueLabel}</div>
        <div className="value">
          <div className="main-value">
            {FormatUtils.formatCurrencyValue(mainValue)}
          </div>
          {subValue &&
            parseFloat(FormatUtils.formatCurrencyValue(subValue)) !== 0 && (
              <div className="sub-value">
                {parseFloat(subValue?.toString()) > 0 ? '+' : ''}
                {FormatUtils.formatCurrencyValue(subValue)} ({subValueLabel})
              </div>
            )}
        </div>
      </div>
      {isExpanded && (
        <>
          <div className="separator" />
          <div className="actions-panel">
            {actionButtons.map((ab, index) => (
              <div
                className="wallet-action-button"
                onClick={($event) => handleClick($event, ab)}
                key={`action-${ab.label}-${index}`}>
                <SVGIcon icon={ab.icon} className="action-icon" />
                <div className="title">
                  {chrome.i18n.getMessage(ab.label, ab.labelParams)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    globalProperties: state.globalProperties,
  };
};

const connector = connect(mapStateToProps, {
  navigateToWithParams,
});
type PropsFromRedux = ConnectedProps<typeof connector> &
  WalletSectionInfoItemProps;

export const WalletInfoSectionItemComponent = connector(walletInfoSectionItem);
