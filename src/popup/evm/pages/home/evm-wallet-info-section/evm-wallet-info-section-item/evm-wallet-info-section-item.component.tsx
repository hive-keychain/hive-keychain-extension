import { NativeAndErc20Token } from '@popup/evm/interfaces/active-account.interface';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { EVMWalletInfoSectionActions } from '@popup/evm/pages/home/evm-wallet-info-section/evm-wallet-info-section-actions';
import { EvmTokenLogo } from '@popup/evm/pages/home/evm-token-logo/evm-token-logo.component';
import { ActionButton } from '@popup/hive/pages/app-container/home/hive-wallet-info-section/hive-wallet-info-section-actions';
import { navigateToWithParams } from '@popup/multichain/actions/navigation.actions';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import React, { BaseSyntheticEvent, useCallback, useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import {
  COPY_GENERIC_MESSAGE_KEY,
  copyTextWithToast,
} from 'src/common-ui/toast/copy-toast.utils';
import { WalletInfoSectionItemButton } from 'src/common-ui/wallet-info-section-item-button/wallet-info-section-item-button.component';
import { WalletTokenDetailPanel } from 'src/common-ui/wallet-token-detail-panel/wallet-token-detail-panel.component';
import { WalletTokenPriceChart } from 'src/common-ui/wallet-token-price-chart/wallet-token-price-chart.component';
import FormatUtils from 'src/utils/format.utils';
import { I18nUtils } from 'src/utils/i18n.utils';

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

const normalizeExplorerUrl = (url: string) => url.replace(/\/+$/, '');

const getTokenExplorerUrl = (
  explorerBaseUrl: string | undefined,
  contractAddress: string,
): string | undefined => {
  if (!explorerBaseUrl) {
    return undefined;
  }
  return `${normalizeExplorerUrl(explorerBaseUrl)}/token/${contractAddress}`;
};

export const WalletInfoSectionItem = ({
  token,
  icon,
  addBackground,
  mainValueSubLabel,
  mainValue,
  mainValueLabel,
  subValue,
  subValueLabel,
  chain,
  navigateToWithParams,
}: PropsFromRedux) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [detailsId] = useState(
    () =>
      `evm-wallet-details-${token.tokenInfo.symbol.replace(
        /[^a-zA-Z0-9_-]/g,
        '-',
      )}`,
  );
  const [actionButtons, setActionButtons] = useState<ActionButton[]>([]);
  const contractAddress =
    token.tokenInfo.type === EVMSmartContractType.ERC20
      ? token.tokenInfo.contractAddress
      : undefined;
  const tokenExplorerUrl = contractAddress
    ? getTokenExplorerUrl(chain?.blockExplorer?.url, contractAddress)
    : undefined;

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    setActionButtons(EVMWalletInfoSectionActions(token));
  };

  const openPanel = () => {
    setIsPanelOpen(true);
  };

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  const handleClick = (
    event: BaseSyntheticEvent,
    actionButton: ActionButton,
  ) => {
    event.stopPropagation();
    closePanel();
    if (actionButton.onClick) {
      actionButton.onClick();
      return;
    }
    if (actionButton.nextScreen) {
      navigateToWithParams(
        actionButton.nextScreen,
        actionButton.nextScreenParams,
      );
    }
  };

  const copyContractAddress = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!contractAddress) {
      return;
    }
    void copyTextWithToast(contractAddress, COPY_GENERIC_MESSAGE_KEY);
  };

  const openTokenInBlockExplorer = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();
    if (!tokenExplorerUrl) {
      return;
    }
    chrome.tabs.create({ url: tokenExplorerUrl });
  };

  const tokenLogo =
    token.tokenInfo.type === EVMSmartContractType.ERC20 &&
    token.tokenInfo.lpV2 ? (
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
    ) : (
      <EvmTokenLogo tokenInfo={token.tokenInfo} />
    );

  return (
    <div className={`wallet-info-row ${isPanelOpen ? 'opened' : ''}`}>
      <button
        type="button"
        data-testid="wallet-info-section-row"
        className="information-panel"
        aria-expanded={isPanelOpen}
        aria-haspopup="dialog"
        aria-controls={isPanelOpen ? detailsId : undefined}
        onClick={openPanel}>
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
      <WalletTokenDetailPanel
        isOpen={isPanelOpen}
        onClose={closePanel}
        title={mainValueLabel}
        titleId={detailsId}
        logo={tokenLogo}
        dataTestId={`wallet-token-detail-panel-${token.tokenInfo.symbol}`}
        footer={
          <div className="actions-panel">
            {actionButtons.map((ab, index) => (
              <WalletInfoSectionItemButton
                key={`action-${ab.label}-${index}`}
                actionButton={ab}
                handleClick={handleClick}
              />
            ))}
          </div>
        }>
        <div className="wallet-info-details">
          <WalletTokenPriceChart symbol={token.tokenInfo.symbol} />
          {contractAddress && (
            <div className="wallet-token-detail-panel-contract">
              <div className="wallet-token-detail-panel-contract-label">
                {I18nUtils.getMessage('evm_operation_smart_contract_address')}
              </div>
              <div className="wallet-token-detail-panel-contract-row">
                <span
                  className="wallet-token-detail-panel-contract-address"
                  data-testid={`wallet-token-detail-panel-contract-${token.tokenInfo.symbol}`}>
                  {contractAddress}
                </span>
                <button
                  type="button"
                  className="wallet-token-detail-panel-contract-copy"
                  aria-label={I18nUtils.getMessage('html_popup_copy')}
                  data-testid={`wallet-token-detail-panel-contract-copy-${token.tokenInfo.symbol}`}
                  onClick={copyContractAddress}>
                  <SVGIcon icon={SVGIcons.SELECT_COPY} />
                </button>
                {tokenExplorerUrl && (
                  <CustomTooltip
                    message="portfolio_history_view_on_explorer"
                    position="top"
                    delayShow={300}>
                    <button
                      type="button"
                      className="wallet-token-detail-panel-contract-explorer"
                      aria-label={I18nUtils.getMessage(
                        'portfolio_history_view_on_explorer',
                      )}
                      data-testid={`wallet-token-detail-panel-contract-explorer-${token.tokenInfo.symbol}`}
                      onClick={openTokenInBlockExplorer}>
                      <SVGIcon icon={SVGIcons.GLOBAL_EXTERNAL_LINK} />
                    </button>
                  </CustomTooltip>
                )}
              </div>
            </div>
          )}
        </div>
      </WalletTokenDetailPanel>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    chain: state.chain as EvmChain,
  };
};

const connector = connect(mapStateToProps, {
  navigateToWithParams,
});
type PropsFromRedux = ConnectedProps<typeof connector> &
  EVMWalletSectionInfoItemProps;

export const EVMWalletInfoSectionItemComponent = connector(
  WalletInfoSectionItem,
);
