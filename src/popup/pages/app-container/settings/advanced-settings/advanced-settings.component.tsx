import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { MenuComponent } from 'src/common-ui/menu/menu.component';
import AdvancedSettingsMenuItems from './advanced-settings-menu-items';
import './advanced-settings.component.scss';

const AdvancedSettingsPage = ({}: PropsFromRedux) => {
  return (
    <div aria-label="advanced-settings-page" className="advanced-settings-page">
      <MenuComponent
        title="popup_html_advanced_settings"
        isBackButtonEnable={true}
        menuItems={AdvancedSettingsMenuItems}></MenuComponent>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const AdvancedSettingsPageComponent = connector(AdvancedSettingsPage);
