import {
  HBDDropdownMenuItems,
  HiveDropdownMenuItems,
  HpDropdownMenuItems,
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
  const [delegationAmount, setDelegationAmount] = useState<string | number>(
    '...',
  );

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
      setDelegationAmount(delegation);
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
        mainValue={FormatUtils.toHP(
          activeAccount.account.vesting_shares as string,
          globalProperties.globals,
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
