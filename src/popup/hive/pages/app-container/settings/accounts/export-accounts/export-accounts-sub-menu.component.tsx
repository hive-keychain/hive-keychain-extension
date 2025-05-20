import ExportAccountsSubMenuItems from '@popup/hive/pages/app-container/settings/accounts/export-accounts-sub-menu-items';
import { RootState } from '@popup/multichain/store';
import { Screen } from '@reference-data/screen.enum';
import React from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { MenuComponent } from 'src/common-ui/menu/menu.component';

const ExportAccountsSubMenu = ({}: PropsFromRedux) => {
  return (
    <div
      className="settings-export-accounts-submenu"
      data-testid={`${Screen.SETTINGS_EXPORT_ACCOUNTS}-page`}>
      <MenuComponent
        title="popup_html_export_accounts"
        isBackButtonEnable={true}
        menuItems={ExportAccountsSubMenuItems}></MenuComponent>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ExportAccountsSubMenuComponent = connector(ExportAccountsSubMenu);
