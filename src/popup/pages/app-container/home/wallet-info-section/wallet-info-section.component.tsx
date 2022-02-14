import {
  HBDDropdownMenuItems,
  HiveDropdownMenuItems,
  HpDropdownMenuItems,
} from '@popup/pages/app-container/home/wallet-info-section/wallet-info-dropdown-menus.list';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { DropdownMenuItemInterface } from 'src/common-ui/dropdown-menu/dropdown-menu-item/dropdown-menu-item.interface';
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
  const [dropdownItems, setDropdownItems] = useState<
    DropdownMenuItemInterface[]
  >([]);

  const [delegationAmount, setDelegationAmount] = useState('...');
  const [hasDelegation, setHasDelegations] = useState(false);

  useEffect(() => {
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

    setHasDelegations(delegation !== 0);

    setDelegationAmount(
      `${delegation > 0 ? '+' : '-'} ${FormatUtils.withCommas(
        Math.abs(delegation).toFixed(3),
      )}`,
    );
  }, [activeAccount]);

  const toggleDropdown = (
    event: any,
    menuItems: DropdownMenuItemInterface[],
  ) => {
    event.stopPropagation();
    setDisplayDropdown(!displayDropdown);
    setDropdownPosition({
      x: event.target.offsetLeft + 10,
      y: event.target.offsetParent.offsetTop + 32,
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
              ({chrome.i18n.getMessage('popup_html_delegations')})
            </div>
          )}
        </div>
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
    delegations: state.delegations,
  };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const WalletInfoSectionComponent = connector(WalletInfoSection);
