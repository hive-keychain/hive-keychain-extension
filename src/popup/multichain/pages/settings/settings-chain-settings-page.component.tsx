import { Screen } from '@interfaces/screen.interface';
import { RootState } from '@popup/multichain/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { MenuComponent } from 'src/common-ui/menu/menu.component';
import { getSettingsChainSettingsMenuItems } from 'src/popup/multichain/pages/settings/settings-chain-settings-menu-items';

const SettingsChainSettingsPage = ({
  evmAccountsCount,
  hiveAccountsCount,
}: PropsFromRedux) => {
  return (
    <div
      data-testid={`${Screen.SETTINGS_CHAIN_SETTINGS}-page`}
      className="settings-chain-settings-page">
      <MenuComponent
        title="popup_html_chain_settings"
        isBackButtonEnable={true}
        menuItems={getSettingsChainSettingsMenuItems({
          hasEvmAccounts: evmAccountsCount > 0,
          hasHiveAccounts: hiveAccountsCount > 0,
        })}
      />
    </div>
  );
};

const connector = connect((state: RootState) => ({
  evmAccountsCount: state.evm.accounts.length,
  hiveAccountsCount: state.hive.accounts.length,
}));

type PropsFromRedux = ConnectedProps<typeof connector>;

export const SettingsChainSettingsPageComponent = connector(
  SettingsChainSettingsPage,
);
