import { Asset } from '@hiveio/dhive';
import { NativeAndErc20Token } from '@popup/evm/interfaces/active-account.interface';
import { EVMWalletInfoSectionActions } from '@popup/evm/pages/home/evm-wallet-info-section/evm-wallet-info-section-actions';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import { ActionButton } from '@popup/hive/pages/app-container/home/hive-wallet-info-section/hive-wallet-info-section-actions';
import { navigateToWithParams } from '@popup/multichain/actions/navigation.actions';
import { RootState } from '@popup/multichain/store';
import React, { BaseSyntheticEvent, useEffect, useRef, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { WalletInfoSectionItemButton } from 'src/common-ui/wallet-info-section-item-button/wallet-info-section-item-button.component';
import { ColorsUtils } from 'src/utils/colors.utils';
import FormatUtils from 'src/utils/format.utils';

interface EVMWalletSectionInfoItemProps {
  token: NativeAndErc20Token;
  icon: SVGIcons;
  addBackground?: boolean;
  mainValue: string | Asset | number;
  mainValueLabel: string;
  mainValueSubLabel: string;
  subValue?: string | Asset | number;
  subValueLabel?: string;
}

const WalletInfoSectionItem = ({
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
  const [actionButtons, setActionButtons] = useState<ActionButton[]>([]);
  const reff = useRef<HTMLDivElement>(null);
  const [color, setColor] = useState<string>();

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (token && !token.tokenInfo.logo) {
      setColor(ColorsUtils.stringToColor(token.tokenInfo.name));
    }
  }, [token]);

  const init = async () => {
    setActionButtons(EVMWalletInfoSectionActions(token));
  };

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

  const handleHistoryClick = (
    event: BaseSyntheticEvent,
    token?: NativeAndErc20Token,
  ) => {
    event.stopPropagation();
    navigateToWithParams(EvmScreen.EVM_TOKEN_HISTORY, { token });
  };

  const goToTokenWebsite = (token: NativeAndErc20Token) => {
    // chrome.tabs.create({ url: token });
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
        {token.tokenInfo.logo && (
          <PreloadedImage
            src={token.tokenInfo?.logo}
            className="currency-icon"
            addBackground
            useDefaultSVG={icon}
          />
        )}
        {!token.tokenInfo.logo && (
          <div
            className="currency-icon add-background"
            style={{
              backgroundColor: `${color}2b`,
              color: `${color}`,
            }}>
            {token.tokenInfo.symbol.slice(0, 2)}
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
        {isExpanded && (
          <SVGIcon
            icon={SVGIcons.WALLET_HISTORY_BUTTON}
            className={`history-icon`}
            onClick={($event) => handleHistoryClick($event, token)}
            hoverable
          />
        )}
      </div>
      {isExpanded && (
        <>
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
