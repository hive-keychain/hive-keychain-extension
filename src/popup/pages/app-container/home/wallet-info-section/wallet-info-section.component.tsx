import {
  HBDDropdownMenuItems,
  HiveDropdownMenuItems,
  HpDropdownMenuItems,
} from '@popup/pages/app-container/home/wallet-info-section/wallet-info-dropdown-menus.list';
import { RootState } from '@popup/store';
import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { DropdownMenuItem } from 'src/common-ui/dropdown-menu/dropdown-menu-item/dropdown-menu-item.interface';
import DropdownMenu, {
  DropdownPosition,
} from 'src/common-ui/dropdown-menu/dropdown-menu.component';
import CurrencyUtils from 'src/utils/currency.utils';
import FormatUtils from 'src/utils/format.utils';
import './wallet-info-section.component.scss';

const WalletInfoSection = ({
  activeAccount,
  currencyLabels,
  globalProperties,
}: PropsFromRedux) => {
  const [displayDropdown, setDisplayDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>();
  const [dropdownItems, setDropdownItems] = useState<DropdownMenuItem[]>([]);

  const toggleDropdown = (event: any, menuItems: DropdownMenuItem[]) => {
    event.stopPropagation();
    setDisplayDropdown(!displayDropdown);
    setDropdownPosition({
      x: event.target.offsetLeft + event.target.offsetWidth,
      y: event.target.offsetTop + event.target.offsetHeight,
    });
    setDropdownItems(menuItems);
  };

  return (
    <div
      className="wallet-info-section"
      onClick={() => setDisplayDropdown(false)}>
      {displayDropdown && dropdownPosition && (
        <DropdownMenu
          dropdownMenuItems={dropdownItems}
          position={dropdownPosition}
        />
      )}

      <div className="wallet-info-row wallet-info-hive">
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
          className="dropdown-arrow"
          src="/assets/images/uparrow.png"
          onClick={(event) => toggleDropdown(event, HBDDropdownMenuItems)}
        />
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
        <img
          className="dropdown-arrow"
          src="/assets/images/uparrow.png"
          onClick={(event) => toggleDropdown(event, HpDropdownMenuItems)}
        />
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
