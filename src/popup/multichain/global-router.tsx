import { Screen } from '@interfaces/screen.interface';
import { EcosystemComponent } from '@popup/hive/pages/app-container/home/ecosystem/ecosystem.component';
import { AboutPageComponent } from '@popup/hive/pages/app-container/settings/about/about.component';
import { AnalyticsComponent } from '@popup/hive/pages/app-container/settings/advanced-settings/analytics/analytics.component';
import { AutoLockComponent } from '@popup/hive/pages/app-container/settings/advanced-settings/auto-lock/auto-lock.component';
import { ChangePasswordComponent } from '@popup/hive/pages/app-container/settings/advanced-settings/change-password/change-password.component';
import { ClearAllDataComponent } from '@popup/hive/pages/app-container/settings/advanced-settings/clear-all-data/clear-all-data.component';
import { KeychainifyComponent } from '@popup/hive/pages/app-container/settings/advanced-settings/keychainify/keychainify.component';
import { HelpSubMenuComponent } from '@popup/hive/pages/app-container/settings/help-sub-menu/help-sub-menu.component';
import { MultichainScreen } from '@popup/multichain/reference-data/multichain-screen.enum';
import React from 'react';
import { SettingsConnectedDappsPageComponent } from 'src/popup/multichain/pages/settings/settings-connected-dapps-page.component';
import { SettingsContactsPageComponent } from 'src/popup/multichain/pages/settings/settings-contacts-page.component';
import { SettingsEvmPageComponent } from 'src/popup/multichain/pages/settings/settings-evm-page.component';
import { SettingsHivePageComponent } from 'src/popup/multichain/pages/settings/settings-hive-page.component';
import { SettingsNetworkPageComponent } from 'src/popup/multichain/pages/settings/settings-network-page.component';
import { SettingsPreferencesDisplayPageComponent } from 'src/popup/multichain/pages/settings/settings-preferences-display-page.component';

export const globalRouter = (page: Screen) => {
  switch (page) {
    case MultichainScreen.ECOSYSTEM_PAGE:
      return <EcosystemComponent />;

    //Settings
    case MultichainScreen.SETTINGS_ABOUT:
      return <AboutPageComponent />;
    case MultichainScreen.SETTINGS_HELP:
      return <HelpSubMenuComponent />;
    case MultichainScreen.SETTINGS_CHANGE_PASSWORD:
      return <ChangePasswordComponent />;
    case MultichainScreen.SETTINGS_AUTO_LOCK:
      return <AutoLockComponent />;
    case MultichainScreen.SETTINGS_KEYCHAINIFY:
      return <KeychainifyComponent />;
    case MultichainScreen.SETTINGS_CLEAR_ALL_DATA:
      return <ClearAllDataComponent />;
    case MultichainScreen.SETTINGS_ANALYTICS:
      return <AnalyticsComponent />;
    case MultichainScreen.SETTINGS_RPC_NODES:
      return <SettingsNetworkPageComponent />;
    case MultichainScreen.SETTINGS_CONTACTS:
      return <SettingsContactsPageComponent />;
    case MultichainScreen.SETTINGS_NETWORK:
      return <SettingsNetworkPageComponent />;
    case MultichainScreen.SETTINGS_CONNECTED_DAPPS:
      return <SettingsConnectedDappsPageComponent />;
    case MultichainScreen.SETTINGS_PREFERENCES_AND_DISPLAY:
      return <SettingsPreferencesDisplayPageComponent />;
    case MultichainScreen.SETTINGS_EVM:
      return <SettingsEvmPageComponent />;
    case MultichainScreen.SETTINGS_HIVE:
      return <SettingsHivePageComponent />;
    default:
      return null;
  }
};
