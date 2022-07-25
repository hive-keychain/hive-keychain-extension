import {
  HBDDropdownMenuItems,
  HiveDropdownMenuItems,
  HpDropdownMenuItems
} from '@popup/pages/app-container/home/wallet-info-section/wallet-info-dropdown-menus.list';
import { WalletInfoSectionItemComponent } from '@popup/pages/app-container/home/wallet-info-section/wallet-info-section-item/wallet-info-section-item.component';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ActiveAccountUtils from 'src/utils/active-account.utils';
import CurrencyUtils from 'src/utils/currency.utils';
import FormatUtils from 'src/utils/format.utils';
import './wallet-info-section.component.scss';

const WalletInfoSection = ({
  activeAccount,
  currencyLabels,
  globalProperties,
}: PropsFromRedux) => {
  const [delegationAmount, setDelegationAmount] = useState('...');

  useEffect(() => {
    if (activeAccount && !ActiveAccountUtils.isEmpty(activeAccount)) {
      const delegatedVestingShares = parseFloat(
        activeAccount.account.delegated_vesting_shares
          .toString()
          .replace(' VESTS', ''),
      );
      const receivedVestingShares = parseFloat(
        activeAccount.account.received_vesting_shares
          .toString()
          .replace(' VESTS', ''),
      );
      const delegationVestingShares = (
        receivedVestingShares - delegatedVestingShares
      ).toFixed(3);

      const delegation = FormatUtils.toHP(
        delegationVestingShares,
        globalProperties.globals,
      );

      setDelegationAmount(`${delegation}`);
    }
  }, [activeAccount]);

  return (
    <div className="wallet-info-section">
      <WalletInfoSectionItemComponent
        mainValue={activeAccount.account.balance}
        mainValueLabel={currencyLabels.hive}
        subValue={activeAccount.account.savings_balance}
        subValueLabel={chrome.i18n.getMessage('popup_html_wallet_savings')}
        menuItems={HiveDropdownMenuItems}
      />
      <WalletInfoSectionItemComponent
        mainValue={activeAccount.account.hbd_balance}
        mainValueLabel={currencyLabels.hbd}
        subValue={activeAccount.account.savings_hbd_balance}
        subValueLabel={chrome.i18n.getMessage('popup_html_wallet_savings')}
        menuItems={HBDDropdownMenuItems}
      />
      <WalletInfoSectionItemComponent
        mainValue={FormatUtils.withCommas(
          FormatUtils.toHP(
            activeAccount.account.vesting_shares as string,
            globalProperties.globals,
          ).toString(),
        )}
        mainValueLabel={currencyLabels.hp}
        subValue={delegationAmount}
        subValueLabel={
          chrome.i18n.getMessage('popup_html_delegations').length <= 5
            ? chrome.i18n.getMessage('popup_html_delegations')
            : chrome.i18n.getMessage('popup_html_delegations').slice(0, 5) + '.'
        }
        menuItems={HpDropdownMenuItems}
      />

      {/* <div className="wallet-info-row wallet-info-hive">
        <div className="value">
          <div className="balance">
            {FormatUtils.formatCurrencyValue(activeAccount.account.balance)}
          </div>
          {parseFloat(
            FormatUtils.formatCurrencyValue(
              activeAccount.account.savings_balance,
            ),
          ) > 0 && (
            <div className="savings">
              {'+ '}
              {FormatUtils.formatCurrencyValue(
                activeAccount.account.savings_balance,
              )}
            </div>
          )}
        </div>
        <div className="currency">
          <div className="balance">{currencyLabels.hive}</div>
          {parseFloat(
            FormatUtils.formatCurrencyValue(
              activeAccount.account.savings_balance,
            ),
          ) > 0 && (
            <div className="savings">
              ({chrome.i18n.getMessage('popup_html_wallet_savings')})
            </div>
          )}
        </div>
        <img
          aria-label="dropdown-arrow-hive"
          className="dropdown-arrow"
          src="/assets/images/uparrow.png"
          onClick={(event) => toggleDropdown(event, HiveDropdownMenuItems)}
        />
      </div>
      <div className="wallet-info-row wallet-info-hdb">
        <div className="value">
          <div className="balance">
            {FormatUtils.formatCurrencyValue(activeAccount.account.hbd_balance)}
          </div>
          {parseFloat(
            FormatUtils.formatCurrencyValue(
              activeAccount.account.savings_hbd_balance,
            ),
          ) > 0 && (
            <div className="savings">
              {'+ '}
              {FormatUtils.formatCurrencyValue(
                activeAccount.account.savings_hbd_balance,
              )}
            </div>
          )}
        </div>
        <div className="currency">
          <div className="balance">{currencyLabels.hbd}</div>
          {parseFloat(
            FormatUtils.formatCurrencyValue(
              activeAccount.account.savings_hbd_balance,
            ),
          ) > 0 && (
            <div className="savings">
              ({chrome.i18n.getMessage('popup_html_wallet_savings')})
            </div>
          )}
        </div>
        <img
          aria-label="dropdown-arrow-hbd"
          className="dropdown-arrow"
          src="/assets/images/uparrow.png"
          onClick={(event) => toggleDropdown(event, HBDDropdownMenuItems)}
        />
      </div>
      <div className="wallet-info-row wallet-info-hp">
        <div className="value">
          <div className="balance">
            {FormatUtils.withCommas(
              FormatUtils.toHP(
                activeAccount.account.vesting_shares as string,
                globalProperties.globals,
              ).toString(),
            )}
          </div>
          {hasDelegation && <div className="savings">{delegationAmount}</div>}
        </div>
        <div className="currency">
          <div className="balance">{currencyLabels.hp}</div>
          {hasDelegation && (
            <div className="savings">
              (
              {chrome.i18n.getMessage('popup_html_delegations').length <= 5
                ? chrome.i18n.getMessage('popup_html_delegations')
                : chrome.i18n.getMessage('popup_html_delegations').slice(0, 5) +
                  '.'}
              )
            </div>
          )}
        </div>
        <img
          aria-label="dropdown-arrow-hp"
          className="dropdown-arrow"
          src="/assets/images/uparrow.png"
          onClick={(event) => toggleDropdown(event, HpDropdownMenuItems)}
        />
      </div> */}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    currencyLabels: CurrencyUtils.getCurrencyLabels(state.activeRpc?.testnet!),
    globalProperties: state.globalProperties,
    delegations: state.delegations,
  };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const WalletInfoSectionComponent = connector(WalletInfoSection);
