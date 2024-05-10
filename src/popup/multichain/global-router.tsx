import { Screen } from '@interfaces/screen.interface';
import { EcosystemComponent } from '@popup/hive/pages/app-container/home/ecosystem/ecosystem.component';
import { AboutPageComponent } from '@popup/hive/pages/app-container/settings/about/about.component';
import { AnalyticsComponent } from '@popup/hive/pages/app-container/settings/advanced-settings/analytics/analytics.component';
import { AutoLockComponent } from '@popup/hive/pages/app-container/settings/advanced-settings/auto-lock/auto-lock.component';
import { ChangePasswordComponent } from '@popup/hive/pages/app-container/settings/advanced-settings/change-password/change-password.component';
import { ClearAllDataComponent } from '@popup/hive/pages/app-container/settings/advanced-settings/clear-all-data/clear-all-data.component';
import { KeychainifyComponent } from '@popup/hive/pages/app-container/settings/advanced-settings/keychainify/keychainify.component';
import { RpcNodesComponent } from '@popup/hive/pages/app-container/settings/advanced-settings/rpc-nodes/rpc-nodes.component';
import { HelpSubMenuComponent } from '@popup/hive/pages/app-container/settings/help-sub-menu/help-sub-menu.component';
import { AddCustomChainPage } from '@popup/multichain/pages/add-custom-chain/add-custom-chain.component';
import { ChainSelectorPageComponent } from '@popup/multichain/pages/chain-selector/chain-selector.component';
import { MultichainScreen } from '@popup/multichain/reference-data/multichain-screen.enum';
import React from 'react';

export const globalRouter = (page: Screen) => {
  switch (page) {
    case MultichainScreen.SELECT_BLOCKCHAIN_PAGE:
      return <ChainSelectorPageComponent hasBackButton />;
    case MultichainScreen.CREATE_BLOCKCHAIN_PAGE:
      return <AddCustomChainPage />;
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
      return <RpcNodesComponent />;
    default:
      return null;
  }
};
