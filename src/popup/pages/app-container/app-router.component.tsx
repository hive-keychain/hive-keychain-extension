import { AddAccountRouterComponent } from '@popup/pages/add-account/add-account-router/add-account-router.component';
import { AddByAuthComponent } from '@popup/pages/add-account/add-by-auth/add-by-auth.component';
import { AddByKeysComponent } from '@popup/pages/add-account/add-by-keys/add-by-keys.component';
import { ImportKeysComponent } from '@popup/pages/add-account/import-keys/import-keys.component';
import { SelectKeysComponent } from '@popup/pages/add-account/select-keys/select-keys.component';
import { BuyCoinsComponent } from '@popup/pages/app-container/home/buy-coins/buy-coins.component';
import { ConversionComponent } from '@popup/pages/app-container/home/conversion/conversion.component';
import { AccountValueExplanationComponent } from '@popup/pages/app-container/home/estimated-account-value-section/account-value-explanation/account-value-explanation.component';
import { HomeComponent } from '@popup/pages/app-container/home/home.component';
import { PowerUpDownComponent } from '@popup/pages/app-container/home/power-up-down/power-up-down.component';
import { SavingsPageComponent } from '@popup/pages/app-container/home/savings/savings.component';
import { TokensComponent } from '@popup/pages/app-container/home/tokens/tokens.component';
import { TransferFundsComponent } from '@popup/pages/app-container/home/transfer-fund/transfer-fund.component';
import { WalletHistoryComponent } from '@popup/pages/app-container/home/wallet-history/wallet-history.component';
import { WitnessVotingComponent } from '@popup/pages/app-container/home/witness-voting/witness-voting.component';
import { AccountSubMenuComponent } from '@popup/pages/app-container/settings/accounts/account-sub-menu.component';
import { AddKeyComponent } from '@popup/pages/app-container/settings/accounts/manage-account/add-key/add-key.component';
import { ManageAccountComponent } from '@popup/pages/app-container/settings/accounts/manage-account/manage-account.component';
import { AdvancedSettingsPageComponent } from '@popup/pages/app-container/settings/advanced-settings/advanced-settings.component';
import { AutoLockComponent } from '@popup/pages/app-container/settings/advanced-settings/auto-lock/auto-lock.component';
import { ChangePasswordComponent } from '@popup/pages/app-container/settings/advanced-settings/change-password/change-password.component';
import { ClearAllDataComponent } from '@popup/pages/app-container/settings/advanced-settings/clear-all-data/clear-all-data.component';
import { ImportExportComponent } from '@popup/pages/app-container/settings/advanced-settings/import-export/import-export.component';
import { KeychainifyComponent } from '@popup/pages/app-container/settings/advanced-settings/keychainify/keychainify.component';
import { RpcNodesComponent } from '@popup/pages/app-container/settings/advanced-settings/rpc-nodes/rpc-nodes.component';
import { SettingsMainPageComponent } from '@popup/pages/app-container/settings/settings-main-page/settings-main-page.component';
import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { ConfirmationPageComponent } from 'src/common-ui/confirmation-page/confirmation-page.component';
import { Screen } from 'src/reference-data/screen.enum';

const AppRouter = ({ currentPage }: PropsFromRedux) => {
  const renderAccountPage = (page: Screen) => {
    switch (page) {
      case Screen.HOME_PAGE:
        return <HomeComponent />;
      case Screen.ACCOUNT_VALUE_EXPLANATION:
        return <AccountValueExplanationComponent />;
      case Screen.WITNESS_PAGE:
        return <WitnessVotingComponent />;
      case Screen.TRANSFER_FUND_PAGE:
        return <TransferFundsComponent />;
      case Screen.POWER_UP_PAGE:
        return <PowerUpDownComponent />;
      case Screen.POWER_DOWN_PAGE:
        return <PowerUpDownComponent />;
      case Screen.BUY_COINS_PAGE:
        return <BuyCoinsComponent />;
      case Screen.TOKENS_PAGE:
        return <TokensComponent />;
      case Screen.WALLET_HISTORY_PAGE:
        return <WalletHistoryComponent />;
      case Screen.CONFIRMATION_PAGE:
        return <ConfirmationPageComponent />;
      case Screen.CONVERSION_PAGE:
        return <ConversionComponent />;
      case Screen.SAVINGS_PAGE:
        return <SavingsPageComponent />;
      //Settings Routes
      case Screen.SETTINGS_MAIN_PAGE:
        return <SettingsMainPageComponent />;
      case Screen.SETTINGS_ACCOUNTS:
        return <AccountSubMenuComponent />;
      case Screen.ACCOUNT_PAGE_INIT_ACCOUNT:
        return <AddAccountRouterComponent />;
      case Screen.ACCOUNT_PAGE_ADD_BY_KEYS:
        return <AddByKeysComponent />;
      case Screen.ACCOUNT_PAGE_ADD_BY_AUTH:
        return <AddByAuthComponent />;
      case Screen.ACCOUNT_PAGE_IMPORT_KEYS:
        return <ImportKeysComponent />;
      case Screen.ACCOUNT_PAGE_SELECT_KEYS:
        return <SelectKeysComponent />;
      case Screen.SETTINGS_MANAGE_ACCOUNTS:
        return <ManageAccountComponent />;
      case Screen.SETTINGS_ADD_KEY:
        return <AddKeyComponent />;
      case Screen.SETTINGS_ADVANCED:
        return <AdvancedSettingsPageComponent />;
      case Screen.SETTINGS_CHANGE_PASSWORD:
        return <ChangePasswordComponent />;
      case Screen.SETTINGS_RPC_NODES:
        return <RpcNodesComponent />;
      case Screen.SETTINGS_AUTO_LOCK:
        return <AutoLockComponent />;
      case Screen.SETTINGS_KEYCHAINIFY:
        return <KeychainifyComponent />;
      case Screen.SETTINGS_CLEAR_ALL_DATA:
        return <ClearAllDataComponent />;
      case Screen.SETTINGS_IMPORT_EXPORT:
        return <ImportExportComponent />;
    }
  };

  return (
    <div className="add-account-router-page">
      {renderAccountPage(currentPage!)}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return { currentPage: state.navigation.stack[0] };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const AppRouterComponent = connector(AppRouter);
