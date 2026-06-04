import { Screen } from '@interfaces/screen.interface';
import { RootState } from '@popup/multichain/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { MenuComponent } from 'src/common-ui/menu/menu.component';
import { SettingsHiveMenuItems } from 'src/popup/multichain/pages/settings/settings-hive-menu-items';

const SettingsHivePage = ({}: PropsFromRedux) => (
  <div
    data-testid={`${Screen.SETTINGS_HIVE}-page`}
    className="settings-hive-page">
    <MenuComponent
      title="hive_settings"
      isBackButtonEnable={true}
      menuItems={SettingsHiveMenuItems}
    />
  </div>
);

const connector = connect((state: RootState) => ({}));

type PropsFromRedux = ConnectedProps<typeof connector>;

export const SettingsHivePageComponent = connector(SettingsHivePage);
