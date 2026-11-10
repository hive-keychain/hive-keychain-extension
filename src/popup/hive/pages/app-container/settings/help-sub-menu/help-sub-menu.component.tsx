import { Screen } from '@interfaces/screen.interface';
import HelpSubMenuItems from '@popup/hive/pages/app-container/settings/help-sub-menu/help-sub-menu-items';
import { RootState } from '@popup/multichain/store';
import React from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { MenuComponent } from 'src/common-ui/menu/menu.component';

const HelpSubMenu = ({}: PropsFromRedux) => {
  return (
    <div
      data-testid={`${Screen.SETTINGS_HELP}-page`}
      className="settings-help-sub-menu-page">
      <MenuComponent
        title="popup_html_help"
        isBackButtonEnable={true}
        menuItems={HelpSubMenuItems}></MenuComponent>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const HelpSubMenuComponent = connector(HelpSubMenu);
