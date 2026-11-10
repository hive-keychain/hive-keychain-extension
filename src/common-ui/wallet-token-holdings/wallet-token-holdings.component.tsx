import React from 'react';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { I18nUtils } from 'src/utils/i18n.utils';

interface Props {
  symbol: string;
  amount: string;
  usdValue?: string;
  contractAddress?: string;
  onCopyContract?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onOpenContractExplorer?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const WalletTokenHoldings = ({
  symbol,
  amount,
  usdValue,
  contractAddress,
  onCopyContract,
  onOpenContractExplorer,
}: Props) => {
  const trimmedContract = contractAddress?.trim();

  return (
    <div
      className="wallet-token-holdings"
      data-testid={`wallet-token-holdings-${symbol}`}>
      <div className="wallet-token-holdings__balance">
        <div className="wallet-token-holdings__label">
          {I18nUtils.getMessage('popup_html_balance')}
        </div>
        <div
          className="wallet-token-holdings__amount"
          data-testid={`wallet-token-holdings-amount-${symbol}`}>
          {amount} {symbol}
        </div>
        {usdValue && (
          <div
            className="wallet-token-holdings__usd"
            data-testid={`wallet-token-holdings-usd-${symbol}`}>
            {usdValue}
          </div>
        )}
      </div>
      {trimmedContract && (
        <div className="wallet-token-holdings__contract">
          <div className="wallet-token-holdings__label">
            {I18nUtils.getMessage('evm_operation_smart_contract_address')}
          </div>
          <div className="wallet-token-holdings__contract-row">
            <span
              className="wallet-token-holdings__contract-address"
              title={trimmedContract}
              data-testid={`wallet-token-detail-panel-contract-${symbol}`}>
              {trimmedContract}
            </span>
            <div className="wallet-token-holdings__contract-actions">
              {onCopyContract && (
                <button
                  type="button"
                  className="wallet-token-holdings__contract-action"
                  aria-label={I18nUtils.getMessage('html_popup_copy')}
                  data-testid={`wallet-token-detail-panel-contract-copy-${symbol}`}
                  onClick={onCopyContract}>
                  <SVGIcon icon={SVGIcons.SELECT_COPY} />
                </button>
              )}
              {onOpenContractExplorer && (
                <CustomTooltip
                  message="portfolio_history_view_on_explorer"
                  position="top"
                  delayShow={300}>
                  <button
                    type="button"
                    className="wallet-token-holdings__contract-action"
                    aria-label={I18nUtils.getMessage(
                      'portfolio_history_view_on_explorer',
                    )}
                    data-testid={`wallet-token-detail-panel-contract-explorer-${symbol}`}
                    onClick={onOpenContractExplorer}>
                    <SVGIcon icon={SVGIcons.GLOBAL_EXTERNAL_LINK} />
                  </button>
                </CustomTooltip>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
