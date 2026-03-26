const dataTestIdDropdown = {
  arrow: {
    hive: 'dropdown-arrow-hive',
    hbd: 'dropdown-arrow-hbd',
    hp: 'dropdown-arrow-hp',
    preFix: 'dropdown-arrow-',
  },
  span: {
    send: 'dropdown-menu-item-send',
    powerUp: 'dropdown-menu-item-arrow_upward',
    buy: 'dropdown-menu-item-shopping_cart',
    convert: 'dropdown-menu-item-currency_exchange',
    savings: 'dropdown-menu-item-savings',
    delegations: 'dropdown-menu-item-swap_horiz',
    powerDown: 'dropdown-menu-item-arrow_downward',
  },
  itemPreFix: 'dropdown-menu-item-',
  select: {
    savings: {
      currency: 'select-currency-savings',
      operation: {
        selector: 'select-operation-type',
        /** Matches `CustomSelectItemComponent`: `custom-select-item-${SavingOperationType.*}` */
        withdraw: 'custom-select-item-popup_html_withdraw',
        deposit: 'custom-select-item-popup_html_deposit',
      },
    },
    preFix: {
      accountItem: 'select-account-item-',
    },
  },
  walletInfo: {
    preFix: 'dropdown-menu-item-',
  },
};

export default dataTestIdDropdown;
