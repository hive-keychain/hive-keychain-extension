import { RootState } from '@popup/multichain/store';
import { Screen } from '@reference-data/screen.enum';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { MenuComponent } from 'src/common-ui/menu/menu.component';
import getAdvancedSettingsMenuItems from './advanced-settings-menu-items';

const AdvancedSettingsPage = ({ isLedgerSupported }: PropsFromRedux) => {
  return (
    <div
      data-testid={`${Screen.SETTINGS_ADVANCED}-page`}
      className="advanced-settings-page">
      <MenuComponent
        title="popup_html_advanced_settings"
        isBackButtonEnable={true}
        menuItems={getAdvancedSettingsMenuItems(
          isLedgerSupported,
        )}></MenuComponent>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return { isLedgerSupported: state.hive.appStatus.isLedgerSupported };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const AdvancedSettingsPageComponent = connector(AdvancedSettingsPage);
