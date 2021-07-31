import AccountSubMenuItems from '@popup/pages/app-container/settings/accounts/account-sub-menu-items';
import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { MenuComponent } from 'src/common-ui/menu/menu.component';

const AccountSubMenu = ({}: PropsFromRedux) => {
  return (
    <div className="settings-account-sub-menu-page">
      <MenuComponent
        title="popup_html_accounts"
        isBackButtonEnable={true}
        menuItems={AccountSubMenuItems}></MenuComponent>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const AccountSubMenuComponent = connector(AccountSubMenu);
