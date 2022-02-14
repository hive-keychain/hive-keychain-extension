import { AddAccountRouterComponent } from '@popup/pages/add-account/add-account-router/add-account-router.component';
import { AddByAuthComponent } from '@popup/pages/add-account/add-by-auth/add-by-auth.component';
import { AddByKeysComponent } from '@popup/pages/add-account/add-by-keys/add-by-keys.component';
import { ImportKeysComponent } from '@popup/pages/add-account/import-keys/import-keys.component';
import { SelectKeysComponent } from '@popup/pages/add-account/select-keys/select-keys.component';
import { BuyCoinsComponent } from '@popup/pages/app-container/home/buy-coins/buy-coins.component';
import { ConversionComponent } from '@popup/pages/app-container/home/conversion/conversion.component';
import { DelegationsComponent } from '@popup/pages/app-container/home/delegations/delegations.component';
import { IncomingOutgoingPageComponent } from '@popup/pages/app-container/home/delegations/incoming-outgoing-page/incoming-outgoing-page.component';
import { GovernanceComponent } from '@popup/pages/app-container/home/governance/governance.component';
import { HomeComponent } from '@popup/pages/app-container/home/home.component';
import { PowerUpDownComponent } from '@popup/pages/app-container/home/power-up-down/power-up-down.component';
import { SavingsPageComponent } from '@popup/pages/app-container/home/savings/savings.component';
import { TokensHistoryComponent } from '@popup/pages/app-container/home/tokens/tokens-history/tokens-history.component';
import { TokensSettingsComponent } from '@popup/pages/app-container/home/tokens/tokens-settings/tokens-settings.component';
import { TokensTransferComponent } from '@popup/pages/app-container/home/tokens/tokens-transfer/tokens-transfer.component';
import { TokensComponent } from '@popup/pages/app-container/home/tokens/tokens.component';
import { TransferFundsComponent } from '@popup/pages/app-container/home/transfer-fund/transfer-fund.component';
import { WalletHistoryComponent } from '@popup/pages/app-container/home/wallet-history/wallet-history.component';
import { AboutPageComponent } from '@popup/pages/app-container/settings/about/about.component';
import { AccountSubMenuComponent } from '@popup/pages/app-container/settings/accounts/account-sub-menu.component';
import { AddKeyComponent } from '@popup/pages/app-container/settings/accounts/manage-account/add-key/add-key.component';
import { ManageAccountComponent } from '@popup/pages/app-container/settings/accounts/manage-account/manage-account.component';
import { AdvancedSettingsPageComponent } from '@popup/pages/app-container/settings/advanced-settings/advanced-settings.component';
import { AutoLockComponent } from '@popup/pages/app-container/settings/advanced-settings/auto-lock/auto-lock.component';
import { ChangePasswordComponent } from '@popup/pages/app-container/settings/advanced-settings/change-password/change-password.component';
import { ClearAllDataComponent } from '@popup/pages/app-container/settings/advanced-settings/clear-all-data/clear-all-data.component';
import { ImportExportPreferencesComponent } from '@popup/pages/app-container/settings/advanced-settings/import-export-preferences/import-export-preferences.component';
import { KeychainifyComponent } from '@popup/pages/app-container/settings/advanced-settings/keychainify/keychainify.component';
import { RpcNodesComponent } from '@popup/pages/app-container/settings/advanced-settings/rpc-nodes/rpc-nodes.component';
import { SettingsMainPageComponent } from '@popup/pages/app-container/settings/settings-main-page/settings-main-page.component';
import { AuthorizedOperationsComponent } from '@popup/pages/app-container/settings/user-preferences/authorized-operations/authorized-operations.component';
import { AutomatedTasksComponent } from '@popup/pages/app-container/settings/user-preferences/automated-tasks/automated-tasks.component';
import { OperationPopupComponent } from '@popup/pages/app-container/settings/user-preferences/operation-popup/operation-popup.component';
import { UserPreferencesPageComponent } from '@popup/pages/app-container/settings/user-preferences/user-preferences.component';
import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { ConfirmationPageComponent } from 'src/common-ui/confirmation-page/confirmation-page.component';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import { Screen } from 'src/reference-data/screen.enum';

const AppRouter = ({
  currentPage,
  titleProperties,
  hasTitle,
}: PropsFromRedux) => {
  console.log(titleProperties, hasTitle);
  const renderAccountPage = (page: Screen) => {
    switch (page) {
      case Screen.HOME_PAGE:
        return <HomeComponent />;
      case Screen.GOVERNANCE_PAGE:
        return <GovernanceComponent />;
      case Screen.TRANSFER_FUND_PAGE:
        return <TransferFundsComponent />;
      case Screen.POWER_UP_PAGE:
        return <PowerUpDownComponent />;
      case Screen.POWER_DOWN_PAGE:
        return <PowerUpDownComponent />;
      case Screen.BUY_COINS_PAGE:
        return <BuyCoinsComponent />;
      case Screen.WALLET_HISTORY_PAGE:
        return <WalletHistoryComponent />;
      case Screen.CONFIRMATION_PAGE:
        return <ConfirmationPageComponent />;
      case Screen.CONVERSION_PAGE:
        return <ConversionComponent />;
      case Screen.SAVINGS_PAGE:
        return <SavingsPageComponent />;
      case Screen.DELEGATION_PAGE:
        return <DelegationsComponent />;
      case Screen.INCOMING_OUTGOING_PAGE:
        return <IncomingOutgoingPageComponent />;
      //Tokens
      case Screen.TOKENS_PAGE:
        return <TokensComponent />;
      case Screen.TOKENS_HISTORY:
        return <TokensHistoryComponent />;
      case Screen.TOKENS_SETTINGS:
        return <TokensSettingsComponent />;
      case Screen.TOKENS_TRANSFER:
        return <TokensTransferComponent />;

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
        return <ImportExportPreferencesComponent />;
      case Screen.SETTINGS_USER_PREFERENCES:
        return <UserPreferencesPageComponent />;
      case Screen.SETTINGS_AUTHORIZED_OPERATIONS:
        return <AuthorizedOperationsComponent />;
      case Screen.SETTINGS_OPERATION_POPUP:
        return <OperationPopupComponent />;
      case Screen.SETTINGS_AUTOMATED_TASKS:
        return <AutomatedTasksComponent />;
      case Screen.SETTINGS_ABOUT:
        return <AboutPageComponent />;
    }
  };

  return (
    <div
      className="app-router"
      style={{
        height: '100%',
        display: 'grid',
        gridTemplateRows: hasTitle ? '70px 1fr' : '1fr',
      }}>
      {hasTitle && (
        <PageTitleComponent
          title={titleProperties.title}
          titleParams={titleProperties.titleParams}
          skipTitleTranslation={titleProperties.skipTitleTranslation}
          isBackButtonEnabled={titleProperties.isBackButtonEnabled}
          isCloseButtonDisabled={
            titleProperties.isCloseButtonDisabled
          }></PageTitleComponent>
      )}
      <div
        className="page-content"
        style={{
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}>
        {renderAccountPage(currentPage!)}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    currentPage: state.navigation.stack[0]
      ? state.navigation.stack[0].currentPage
      : Screen.UNDEFINED,
    hasTitle: state.titleContainer?.title.length > 0,
    titleProperties: state.titleContainer,
  };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const AppRouterComponent = connector(AppRouter);
