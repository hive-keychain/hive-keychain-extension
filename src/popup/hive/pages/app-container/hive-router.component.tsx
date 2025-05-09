import { Screen } from '@interfaces/screen.interface';
import { HiveHomeComponent } from '@popup/hive/pages/app-container/home/hive-home.component';
import { TokenSwapsHistoryComponent } from '@popup/hive/pages/app-container/home/swaps/token-swaps-history/token-swaps-history.component';
import { TokenSwapsComponent } from '@popup/hive/pages/app-container/home/swaps/token-swaps/token-swaps.component';
import { TokenPendingUnstakePage } from '@popup/hive/pages/app-container/home/tokens/token-pending-unstacking/token-pending-unstacking.component';
import { ExportAccountsSubMenuComponent } from '@popup/hive/pages/app-container/settings/accounts/export-accounts/export-accounts-sub-menu.component';
import { ExportedAccountsQRComponent } from '@popup/hive/pages/app-container/settings/accounts/export-accounts/exported-accounts-qr/exported-accounts-qr.component';
import { ExportTransactionsComponent } from '@popup/hive/pages/app-container/settings/user-preferences/export-transactions/export-transactions.component';
import { MultisigComponent } from '@popup/hive/pages/app-container/settings/user-preferences/multisig/multisig.component';
import { NotificationsConfigComponent } from '@popup/hive/pages/app-container/settings/user-preferences/notifications/notifications-config/notifications-config.component';
import { HiveScreen } from '@popup/hive/reference-data/hive-screen.enum';
import { globalRouter } from '@popup/multichain/global-router';
import { MultichainScreen } from '@popup/multichain/reference-data/multichain-screen.enum';
import { RootState } from '@popup/multichain/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { HiveConfirmationPageComponent } from 'src/common-ui/confirmation-page/hive-confirmation-page.component';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import { AddAccountRouterComponent } from 'src/popup/hive/pages/add-account/add-account-router/add-account-router.component';
import { AddByAuthComponent } from 'src/popup/hive/pages/add-account/add-by-auth/add-by-auth.component';
import { AddByKeysComponent } from 'src/popup/hive/pages/add-account/add-by-keys/add-by-keys.component';
import { ImportKeysComponent } from 'src/popup/hive/pages/add-account/import-keys/import-keys.component';
import { SelectKeysComponent } from 'src/popup/hive/pages/add-account/select-keys/select-keys.component';
import { BuyCoinsComponent } from 'src/popup/hive/pages/app-container/home/buy-coins/buy-coins.component';
import { ConversionComponent } from 'src/popup/hive/pages/app-container/home/conversion/conversion.component';
import { PendingConersionPageComponent } from 'src/popup/hive/pages/app-container/home/conversion/pending-conversion/pending-conversion.component';
import { DelegationsComponent } from 'src/popup/hive/pages/app-container/home/delegations/delegations.component';
import { IncomingOutgoingPageComponent } from 'src/popup/hive/pages/app-container/home/delegations/incoming-outgoing-page/incoming-outgoing-page.component';
import { GovernanceComponent } from 'src/popup/hive/pages/app-container/home/governance/governance.component';
import { PowerUpDownComponent } from 'src/popup/hive/pages/app-container/home/power-up-down/power-up-down.component';
import { IncomingOutgoingRcPageComponent } from 'src/popup/hive/pages/app-container/home/rc-delegations/incoming-outgoing-rc-page/incoming-outgoing-rc-page.component';
import { RcDelegationsComponent } from 'src/popup/hive/pages/app-container/home/rc-delegations/rc-delegations.component';
import { PendingSavingsWithdrawalPageComponent } from 'src/popup/hive/pages/app-container/home/savings/pending-savings-withdrawal/pending-savings-withdrawal-page.component';
import { SavingsPageComponent } from 'src/popup/hive/pages/app-container/home/savings/savings.component';
import { TokenIncomingOutgoingPageComponent } from 'src/popup/hive/pages/app-container/home/tokens/token-delegations/token-incoming-outgoing-page/token-incoming-outgoing-page.component';
import { TokensOperationComponent } from 'src/popup/hive/pages/app-container/home/tokens/token-operation/token-operation.component';
import { TokensFilterComponent } from 'src/popup/hive/pages/app-container/home/tokens/tokens-filter/tokens-filter.component';
import { TokensHistoryComponent } from 'src/popup/hive/pages/app-container/home/tokens/tokens-history/tokens-history.component';
import { TokensTransferComponent } from 'src/popup/hive/pages/app-container/home/tokens/tokens-transfer/tokens-transfer.component';
import { TransferFundsComponent } from 'src/popup/hive/pages/app-container/home/transfer-fund/transfer-fund.component';
import { WalletHistoryComponent } from 'src/popup/hive/pages/app-container/home/wallet-history/wallet-history.component';
import { AccountSubMenuComponent } from 'src/popup/hive/pages/app-container/settings/accounts/account-sub-menu.component';
import { CreateAccountStepOneComponent } from 'src/popup/hive/pages/app-container/settings/accounts/create-account/create-account-step-one/create-account-step-one.component';
import { CreateAccountStepTwoComponent } from 'src/popup/hive/pages/app-container/settings/accounts/create-account/create-account-step-two/create-account-step-two.component';
import { ManageAccountAuthoritiesComponent } from 'src/popup/hive/pages/app-container/settings/accounts/manage-account-authorities/manage-account-authorities.component';
import { AddKeyComponent } from 'src/popup/hive/pages/app-container/settings/accounts/manage-account/add-key/add-key.component';
import { ManageAccountComponent } from 'src/popup/hive/pages/app-container/settings/accounts/manage-account/manage-account.component';
import { AdvancedSettingsPageComponent } from 'src/popup/hive/pages/app-container/settings/advanced-settings/advanced-settings.component';
import { ImportExportPreferencesComponent } from 'src/popup/hive/pages/app-container/settings/advanced-settings/import-export-preferences/import-export-preferences.component';
import { SettingsMainPageComponent } from 'src/popup/hive/pages/app-container/settings/settings-main-page/settings-main-page.component';
import { AuthorizedOperationsComponent } from 'src/popup/hive/pages/app-container/settings/user-preferences/authorized-operations/authorized-operations.component';
import { AutomatedTasksComponent } from 'src/popup/hive/pages/app-container/settings/user-preferences/automated-tasks/automated-tasks.component';
import { FavoriteAccountsComponent } from 'src/popup/hive/pages/app-container/settings/user-preferences/favorite-accounts/favorite-accounts.component';
import { OperationPopupComponent } from 'src/popup/hive/pages/app-container/settings/user-preferences/operation-popup/operation-popup.component';
import { UserPreferencesPageComponent } from 'src/popup/hive/pages/app-container/settings/user-preferences/user-preferences.component';

const AppRouter = ({
  currentPage,
  titleProperties,
  hasTitle,
}: PropsFromRedux) => {
  const renderAccountPage = (page: Screen) => {
    switch (page) {
      case MultichainScreen.HOME_PAGE:
        return <HiveHomeComponent />;
      case HiveScreen.GOVERNANCE_PAGE:
        return <GovernanceComponent />;

      case HiveScreen.POWER_UP_PAGE:
        return <PowerUpDownComponent />;
      case HiveScreen.POWER_DOWN_PAGE:
        return <PowerUpDownComponent />;

      case HiveScreen.WALLET_HISTORY_PAGE:
        return <WalletHistoryComponent />;

      case HiveScreen.CONVERSION_PAGE:
        return <ConversionComponent />;
      case HiveScreen.PENDING_CONVERSION_PAGE:
        return <PendingConersionPageComponent />;
      case HiveScreen.SAVINGS_PAGE:
        return <SavingsPageComponent />;
      case HiveScreen.PENDING_SAVINGS_WITHDRAWAL_PAGE:
        return <PendingSavingsWithdrawalPageComponent />;
      case HiveScreen.DELEGATION_PAGE:
        return <DelegationsComponent />;
      case HiveScreen.INCOMING_OUTGOING_PAGE:
        return <IncomingOutgoingPageComponent />;
      case HiveScreen.RC_DELEGATIONS_PAGE:
        return <RcDelegationsComponent />;
      case HiveScreen.RC_DELEGATIONS_INCOMING_OUTGOING_PAGE:
        return <IncomingOutgoingRcPageComponent />;
      //Tokens
      case HiveScreen.TOKENS_HISTORY:
        return <TokensHistoryComponent />;
      case HiveScreen.TOKENS_TRANSFER:
        return <TokensTransferComponent />;
      case HiveScreen.TOKENS_OPERATION:
        return <TokensOperationComponent />;
      case HiveScreen.TOKENS_DELEGATIONS:
        return <TokenIncomingOutgoingPageComponent />;
      case HiveScreen.TOKENS_FILTER:
        return <TokensFilterComponent />;
      case MultichainScreen.BUY_COINS_PAGE:
        return <BuyCoinsComponent />;
      case MultichainScreen.TRANSFER_FUND_PAGE:
        return <TransferFundsComponent />;
      case MultichainScreen.CONFIRMATION_PAGE:
        return <HiveConfirmationPageComponent />;
      case MultichainScreen.TOKEN_SWAP_PAGE:
        return <TokenSwapsComponent />;
      case MultichainScreen.TOKENS_SWAP_HISTORY:
        return <TokenSwapsHistoryComponent />;
      case HiveScreen.TOKENS_PENDING_UNSTAKE:
        return <TokenPendingUnstakePage />;

      //Settings Routes
      case HiveScreen.SETTINGS_MAIN_PAGE:
        return <SettingsMainPageComponent />;
      case HiveScreen.SETTINGS_ACCOUNTS:
        return <AccountSubMenuComponent />;
      case HiveScreen.ACCOUNT_PAGE_INIT_ACCOUNT:
        return <AddAccountRouterComponent />;
      case HiveScreen.ACCOUNT_PAGE_ADD_BY_KEYS:
        return <AddByKeysComponent />;
      case HiveScreen.ACCOUNT_PAGE_ADD_BY_AUTH:
        return <AddByAuthComponent />;
      case HiveScreen.ACCOUNT_PAGE_IMPORT_KEYS:
        return <ImportKeysComponent />;
      case HiveScreen.ACCOUNT_PAGE_SELECT_KEYS:
        return <SelectKeysComponent />;
      case HiveScreen.SETTINGS_MANAGE_ACCOUNTS:
        return <ManageAccountComponent />;
      case HiveScreen.SETTINGS_MANAGE_ACCOUNTS_AUTHORITIES:
        return <ManageAccountAuthoritiesComponent />;
      case Screen.SETTINGS_EXPORT_ACCOUNTS:
        return <ExportAccountsSubMenuComponent />;
      case Screen.SETTINGS_EXPORT_ALL_ACCOUNTS_QR:
        return <ExportedAccountsQRComponent />;
      case Screen.SETTINGS_ADD_KEY:
        return <AddKeyComponent />;
      case HiveScreen.SETTINGS_ADVANCED:
        return <AdvancedSettingsPageComponent />;

      case HiveScreen.SETTINGS_IMPORT_EXPORT:
        return <ImportExportPreferencesComponent />;
      case HiveScreen.SETTINGS_USER_PREFERENCES:
        return <UserPreferencesPageComponent />;
      case HiveScreen.SETTINGS_AUTHORIZED_OPERATIONS:
        return <AuthorizedOperationsComponent />;
      case HiveScreen.SETTINGS_EXPORT_TRANSACTIONS:
        return <ExportTransactionsComponent />;
      case HiveScreen.SETTINGS_OPERATION_POPUP:
        return <OperationPopupComponent />;
      case HiveScreen.SETTINGS_AUTOMATED_TASKS:
        return <AutomatedTasksComponent />;
      case HiveScreen.SETTINGS_FAVORITE_ACCOUNTS:
        return <FavoriteAccountsComponent />;
      case HiveScreen.SETTINGS_NOTIFICATIONS_CONFIGURATION:
        return <NotificationsConfigComponent />;
      case HiveScreen.SETTINGS_MULTISIG:
        return <MultisigComponent />;
      case HiveScreen.CREATE_ACCOUNT_PAGE_STEP_ONE:
        return <CreateAccountStepOneComponent />;
      case HiveScreen.CREATE_ACCOUNT_PAGE_STEP_TWO:
        return <CreateAccountStepTwoComponent />;
      default:
        return globalRouter(page);
    }
  };

  return (
    <div
      className="hive-router"
      style={{
        height: '100%',
        display: 'grid',
        gridTemplateRows: hasTitle ? '80px 1fr' : '1fr',
      }}>
      {hasTitle && (
        <PageTitleComponent {...titleProperties}></PageTitleComponent>
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
