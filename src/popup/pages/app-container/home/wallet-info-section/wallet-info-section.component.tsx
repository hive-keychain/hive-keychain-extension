import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import CurrencyUtils from 'src/utils/currency.utils';
import FormatUtils from 'src/utils/format.utils';
import './wallet-info-section.component.scss';

const WalletInfoSection = ({
  activeAccount,
  currencyLabels,
  globalProperties,
}: PropsFromRedux) => {
  return (
    <div className="wallet-info-section">
      <div className="wallet-info-row wallet-info-hive">
        <div className="value">
          <div className="balance">
            {FormatUtils.formatCurrencyValue(activeAccount.account.balance)}
          </div>
          <div className="savings">
            {FormatUtils.formatCurrencyValue(
              activeAccount.account.savings_balance,
            )}
          </div>
        </div>
        <div className="currency">
          <div className="balance">{currencyLabels.hive}</div>
          <div className="savings">
            ({chrome.i18n.getMessage('popup_html_wallet_savings')})
          </div>
        </div>
        <img className="dropdown-arrow" src="/assets/images/uparrow.png" />
      </div>
      <div className="wallet-info-row wallet-info-hdb">
        <div className="value">
          <div className="balance">
            {FormatUtils.formatCurrencyValue(activeAccount.account.hbd_balance)}
          </div>
          <div className="savings">
            {FormatUtils.formatCurrencyValue(
              activeAccount.account.savings_hbd_balance,
            )}
          </div>
        </div>
        <div className="currency">
          <div className="balance">{currencyLabels.hbd}</div>
          <div className="savings">
            ({chrome.i18n.getMessage('popup_html_wallet_savings')})
          </div>
        </div>
        <img className="dropdown-arrow" src="/assets/images/uparrow.png" />
      </div>
      <div className="wallet-info-row wallet-info-hp">
        <div className="value">
          {FormatUtils.withCommas(
            FormatUtils.toHP(
              activeAccount.account.vesting_shares as string,
              globalProperties.globals,
            ).toString(),
          )}
        </div>
        <div className="currency">{currencyLabels.hp}</div>
        <img className="dropdown-arrow" src="/assets/images/uparrow.png" />
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    currencyLabels: CurrencyUtils.getCurrencyLabels(state.activeRpc?.testnet!),
    globalProperties: state.globalProperties,
  };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const WalletInfoSectionComponent = connector(WalletInfoSection);
