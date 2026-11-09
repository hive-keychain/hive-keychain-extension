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
import { EvmLightNodeApi } from '@api/evm-light-node';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';
import {
  COPY_GENERIC_MESSAGE_KEY,
  copyTextWithToast,
} from 'src/common-ui/toast/copy-toast.utils';
import { WalletInfoSectionItemButton } from 'src/common-ui/wallet-info-section-item-button/wallet-info-section-item-button.component';
import { WalletTokenDetailPanel } from 'src/common-ui/wallet-token-detail-panel/wallet-token-detail-panel.component';
import { WalletTokenHoldings } from 'src/common-ui/wallet-token-holdings/wallet-token-holdings.component';
import { WalletTokenHoldingsUtils } from 'src/common-ui/wallet-token-holdings/wallet-token-holdings.utils';
import { WalletTokenPriceChart } from 'src/common-ui/wallet-token-price-chart/wallet-token-price-chart.component';
import {
  TokenPriceHistory,
  WalletTokenPriceChartUtils,
} from 'src/common-ui/wallet-token-price-chart/wallet-token-price-chart.utils';
import FormatUtils from 'src/utils/format.utils';
import Logger from 'src/utils/logger.utils';

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
  const [priceHistory, setPriceHistory] = useState<TokenPriceHistory | null>(
    null,
  );
  const [priceHistoryLoading, setPriceHistoryLoading] = useState(false);
  const contractAddress =
    token.tokenInfo.type === EVMSmartContractType.ERC20
      ? token.tokenInfo.contractAddress
      : undefined;
  const tokenExplorerUrl = contractAddress
    ? getTokenExplorerUrl(chain?.blockExplorer?.url, contractAddress)
    : undefined;
  const tokenDisplayName =
    token.tokenInfo.type === EVMSmartContractType.NATIVE
      ? token.tokenInfo.symbol
      : token.tokenInfo.name?.trim() || mainValueLabel;
  const hasTokenPrice = WalletTokenPriceChartUtils.hasKnownTokenPrice(
    token.tokenInfo.priceUsd,
  );
  const balanceAmountLabel =
    token.formattedBalance?.trim() || mainValue?.toString() || '';
  const balanceAmountForUsd =
    typeof token.balanceInteger === 'number' &&
    Number.isFinite(token.balanceInteger)
      ? token.balanceInteger
      : WalletTokenHoldingsUtils.parseWalletTokenAmount(mainValue);
  const balanceUsdLabel = WalletTokenHoldingsUtils.formatWalletTokenHoldingUsd(
    balanceAmountForUsd,
    token.tokenInfo.priceUsd,
  );

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (!isPanelOpen || !hasTokenPrice) {
      return;
    }

    const historyPath = chain?.chainId
      ? WalletTokenPriceChartUtils.buildEvmPriceHistoryPath(
          chain.chainId,
          contractAddress,
        )
      : undefined;
    if (!historyPath) {
      setPriceHistory({ categories: [], seriesByCategory: {} });
      setPriceHistoryLoading(false);
      return;
    }

    let cancelled = false;
    setPriceHistoryLoading(true);

    const loadPriceHistory = async () => {
      try {
        const payload = await EvmLightNodeApi.get(historyPath);
        if (!cancelled) {
          setPriceHistory(
            WalletTokenPriceChartUtils.parsePriceHistoryPayload(payload),
          );
        }
      } catch (error) {
        Logger.warn(
          `Token price history unavailable (${historyPath}): ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
        if (!cancelled) {
          setPriceHistory({ categories: [], seriesByCategory: {} });
        }
      } finally {
        if (!cancelled) {
          setPriceHistoryLoading(false);
        }
      }
    };

    void loadPriceHistory();
    return () => {
      cancelled = true;
    };
  }, [isPanelOpen, hasTokenPrice, chain?.chainId, contractAddress]);

  const init = async () => {
    setActionButtons(EVMWalletInfoSectionActions(token));
  };

  const openPanel = () => {
    if (hasTokenPrice) {
      setPriceHistoryLoading(true);
    }
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

  const mainValueText = mainValue?.toString() ?? '';

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
            {mainValueText.length > 10
              ? `${mainValueText.slice(0, 10)}...`
              : mainValueText}
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
        title={tokenDisplayName}
        titleId={detailsId}
        logo={tokenLogo}
        compact={!hasTokenPrice}
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
          {hasTokenPrice && (
            <WalletTokenPriceChart
              symbol={token.tokenInfo.symbol}
              priceHistory={priceHistory}
              priceHistoryLoading={priceHistoryLoading}
            />
          )}
          <WalletTokenHoldings
            symbol={token.tokenInfo.symbol}
            amount={balanceAmountLabel}
            usdValue={balanceUsdLabel}
            contractAddress={contractAddress}
            onCopyContract={contractAddress ? copyContractAddress : undefined}
            onOpenContractExplorer={
              tokenExplorerUrl ? openTokenInBlockExplorer : undefined
            }
          />
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
