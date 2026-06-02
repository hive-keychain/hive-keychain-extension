import { Screen } from '@interfaces/screen.interface';
import { AddWalletMainComponent } from '@popup/evm/pages/add-wallets/add-wallets-main.component';
import { CreateNewWalletVerificationComponent } from '@popup/evm/pages/add-wallets/create-new-wallet/create-new-wallet-verification.component';
import { CreateNewWalletComponent } from '@popup/evm/pages/add-wallets/create-new-wallet/create-new-wallet.component';
import { ImportWalletFromKeyComponent } from '@popup/evm/pages/add-wallets/import-wallet-from-key/import-wallet-from-key.component';
import { ImportWalletConfirmationComponent } from '@popup/evm/pages/add-wallets/import-wallet-from-seed/import-wallet-confirmation.component';
import { ImportWalletFromSeedComponent } from '@popup/evm/pages/add-wallets/import-wallet-from-seed/import-wallet-from-seed.component';
import { EvmHomeComponent } from '@popup/evm/pages/home/evm-home.component';
import { EvmCustomNftsPageComponent } from '@popup/evm/pages/home/evm-custom-nfts-page/evm-custom-nfts-page.component';
import { EvmCustomTokensPageComponent } from '@popup/evm/pages/home/evm-custom-tokens-page/evm-custom-tokens-page.component';
import { EvmLifiSwapComponent } from '@popup/evm/pages/home/evm-lifi-swap/evm-lifi-swap.component';
import { LiFiConfirmationPageComponent } from '@popup/evm/pages/home/evm-lifi-swap/lifi-confirmation-page/lifi-confirmation-page.component';
import { LiFiHistoryPageComponent } from '@popup/evm/pages/home/evm-lifi-swap/lifi-history-page/lifi-history-page.component';
import { EvmNftAllCollectionsPageComponent } from '@popup/evm/pages/home/evm-nft-pages/evm-nft-all-collections-page/evm-nft-all-collections-page.component';
import { EvmNFTTransferComponent } from '@popup/evm/pages/home/evm-nft-pages/evm-nft-transfer/evm-nft-transfer.component';
import { EvmNftCollectionPageComponent } from '@popup/evm/pages/home/evm-nft-pages/evm-ntf-collection-page/evm-ntf-collection-page.component';
import { EvmReceiveComponent } from '@popup/evm/pages/home/receive/evm-receive.component';
import { EvmAccountsComponent } from '@popup/evm/pages/home/settings/evm-accounts/evm-accounts.component';
import { EvmCustomChainsComponent } from '@popup/evm/pages/home/settings/evm-custom-chains/evm-custom-chains.component';
import { EvmTransactionResultComponent } from '@popup/evm/pages/home/transaction-result/transaction-result.component';
import { EvmTransferComponent } from '@popup/evm/pages/home/transfer/evm-transfer.component';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import { KeylessKeychainComponent } from '@popup/hive/pages/add-account/keyless-keychain/keyless-keychain.component';
import { HiveHomeComponent } from '@popup/hive/pages/app-container/home/hive-home.component';
import { TokenSwapsHistoryComponent } from '@popup/hive/pages/app-container/home/swaps/token-swaps-history/token-swaps-history.component';
import { TokenSwapsComponent } from '@popup/hive/pages/app-container/home/swaps/token-swaps/token-swaps.component';
import { TokenPendingUnstakePage } from '@popup/hive/pages/app-container/home/tokens/token-pending-unstacking/token-pending-unstacking.component';
import { PendingRecurrentTransfersPageComponent } from '@popup/hive/pages/app-container/home/transfer-fund/recurrent-transfers/recurrent-transfers.component';
import { ExportAccountsSubMenuComponent } from '@popup/hive/pages/app-container/settings/accounts/export-accounts/export-accounts-sub-menu.component';
import { ExportedAccountsQRComponent } from '@popup/hive/pages/app-container/settings/accounts/export-accounts/exported-accounts-qr/exported-accounts-qr.component';
import { AutoLockComponent } from '@popup/hive/pages/app-container/settings/advanced-settings/auto-lock/auto-lock.component';
import { ChangePasswordComponent } from '@popup/hive/pages/app-container/settings/advanced-settings/change-password/change-password.component';
import { ClearAllDataComponent } from '@popup/hive/pages/app-container/settings/advanced-settings/clear-all-data/clear-all-data.component';
import { ImportExportPreferencesComponent } from '@popup/hive/pages/app-container/settings/advanced-settings/import-export-preferences/import-export-preferences.component';
import { KeychainifyComponent } from '@popup/hive/pages/app-container/settings/advanced-settings/keychainify/keychainify.component';
import { ShortcutsComponent } from '@popup/hive/pages/app-container/settings/advanced-settings/shortcuts/shortcuts.component';
import { AnalyticsComponent } from '@popup/hive/pages/app-container/settings/advanced-settings/analytics/analytics.component';
import { ExportTransactionsComponent } from '@popup/hive/pages/app-container/settings/user-preferences/export-transactions/export-transactions.component';
import { MultisigComponent } from '@popup/hive/pages/app-container/settings/user-preferences/multisig/multisig.component';
import { NotificationsConfigComponent } from '@popup/hive/pages/app-container/settings/user-preferences/notifications/notifications-config/notifications-config.component';
import { HiveScreen } from '@popup/hive/reference-data/hive-screen.enum';
import { MultichainScreen } from '@popup/multichain/reference-data/multichain-screen.enum';
import { RootState } from '@popup/multichain/store';
import React from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { EVMConfirmationPageComponent } from 'src/common-ui/confirmation-page/evm-confirmation-page.component';
import { HiveConfirmationPageComponent } from 'src/common-ui/confirmation-page/hive-confirmation-page.component';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import { AddAccountRouterComponent } from 'src/popup/hive/pages/add-account/add-account-router/add-account-router.component';
import { AddByAuthComponent } from 'src/popup/hive/pages/add-account/add-by-auth/add-by-auth.component';
import { AddByKeysComponent } from 'src/popup/hive/pages/add-account/add-by-keys/add-by-keys.component';
import { ImportKeysComponent } from 'src/popup/hive/pages/add-account/import-keys/import-keys.component';
import { SelectKeysComponent } from 'src/popup/hive/pages/add-account/select-keys/select-keys.component';
import { BuyCoinsComponent } from 'src/popup/hive/pages/app-container/home/buy-coins/buy-coins.component';
import { ConversionComponent } from 'src/popup/hive/pages/app-container/home/conversion/conversion.component';
import { PendingConversionPageComponent } from 'src/popup/hive/pages/app-container/home/conversion/pending-conversion/pending-conversion.component';
import { DelegationsComponent } from 'src/popup/hive/pages/app-container/home/delegations/delegations.component';
import { IncomingOutgoingPageComponent } from 'src/popup/hive/pages/app-container/home/delegations/incoming-outgoing-page/incoming-outgoing-page.component';
import { EcosystemComponent } from 'src/popup/hive/pages/app-container/home/ecosystem/ecosystem.component';
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
import { AboutPageComponent } from 'src/popup/hive/pages/app-container/settings/about/about.component';
import { AccountSubMenuComponent } from 'src/popup/hive/pages/app-container/settings/accounts/account-sub-menu.component';
import { CreateAccountStepOneComponent } from 'src/popup/hive/pages/app-container/settings/accounts/create-account/create-account-step-one/create-account-step-one.component';
import { CreateAccountStepTwoComponent } from 'src/popup/hive/pages/app-container/settings/accounts/create-account/create-account-step-two/create-account-step-two.component';
import { ManageAccountAuthoritiesComponent } from 'src/popup/hive/pages/app-container/settings/accounts/manage-account-authorities/manage-account-authorities.component';
import { AddKeyComponent } from 'src/popup/hive/pages/app-container/settings/accounts/manage-account/add-key/add-key.component';
import { ManageAccountComponent } from 'src/popup/hive/pages/app-container/settings/accounts/manage-account/manage-account.component';
import { AdvancedSettingsPageComponent } from 'src/popup/hive/pages/app-container/settings/advanced-settings/advanced-settings.component';
import { HelpSubMenuComponent } from 'src/popup/hive/pages/app-container/settings/help-sub-menu/help-sub-menu.component';
import { AutomatedTasksComponent } from 'src/popup/hive/pages/app-container/settings/user-preferences/automated-tasks/automated-tasks.component';
import { AddCustomChainPage } from 'src/popup/multichain/pages/add-custom-chain/add-custom-chain.component';
import { ChainSelectorPageComponent } from 'src/popup/multichain/pages/chain-selector/chain-selector.component';
import { ChainType } from 'src/popup/multichain/interfaces/chains.interface';
import { SettingsConnectedDappsPageComponent } from 'src/popup/multichain/pages/settings/settings-connected-dapps-page.component';
import { SettingsContactsPageComponent } from 'src/popup/multichain/pages/settings/settings-contacts-page.component';
import { SettingsEvmPageComponent } from 'src/popup/multichain/pages/settings/settings-evm-page.component';
import { SettingsHivePageComponent } from 'src/popup/multichain/pages/settings/settings-hive-page.component';
import { UnifiedSettingsMainPageComponent } from 'src/popup/multichain/pages/settings/settings-main-page.component';
import { SettingsNetworkPageComponent } from 'src/popup/multichain/pages/settings/settings-network-page.component';
import { SettingsChainSettingsPageComponent } from 'src/popup/multichain/pages/settings/settings-chain-settings-page.component';
import { SettingsHelpAndAboutPageComponent } from 'src/popup/multichain/pages/settings/settings-help-and-about-page.component';
import { SettingsPreferencesDisplayPageComponent } from 'src/popup/multichain/pages/settings/settings-preferences-display-page.component';

const getConfirmationAccountType = (
  activeAccountType: ChainType.HIVE | ChainType.EVM,
  params: unknown,
) => {
  if (!params || typeof params !== 'object') {
    return activeAccountType;
  }

  if ('hasGasFee' in params || 'prefetchedMainTokenInfo' in params) {
    return ChainType.EVM;
  }
  if ('method' in params) {
    return ChainType.HIVE;
  }
  return activeAccountType;
};

const UnifiedRouter = ({
  activeAccountType,
  currentPage,
  navigationParams,
  titleProperties,
  hasTitle,
}: PropsFromRedux) => {
  const renderSharedPage = (page: Screen) => {
    switch (page) {
      case MultichainScreen.HOME_PAGE:
        return activeAccountType === ChainType.EVM ? (
          <EvmHomeComponent />
        ) : (
          <HiveHomeComponent />
        );
      case MultichainScreen.BUY_COINS_PAGE:
        return activeAccountType === ChainType.EVM ? (
          <>EVM on ramp</>
        ) : (
          <BuyCoinsComponent />
        );
      case MultichainScreen.TRANSFER_FUND_PAGE:
        return activeAccountType === ChainType.EVM ? (
          <EvmTransferComponent />
        ) : (
          <TransferFundsComponent />
        );
      case MultichainScreen.CONFIRMATION_PAGE:
        return getConfirmationAccountType(activeAccountType, navigationParams) ===
          ChainType.EVM ? (
          <EVMConfirmationPageComponent />
        ) : (
          <HiveConfirmationPageComponent />
        );
      case MultichainScreen.TOKEN_SWAP_PAGE:
        return activeAccountType === ChainType.EVM ? (
          <EvmLifiSwapComponent />
        ) : (
          <TokenSwapsComponent />
        );
      case MultichainScreen.TOKENS_SWAP_HISTORY:
        return activeAccountType === ChainType.EVM ? (
          <>Swap history</>
        ) : (
          <TokenSwapsHistoryComponent />
        );
      default:
        return undefined;
    }
  };

  const renderPage = (page: Screen) => {
    const sharedPage = renderSharedPage(page);
    if (sharedPage !== undefined) {
      return sharedPage;
    }

    switch (page) {
      case MultichainScreen.CREATE_BLOCKCHAIN_PAGE:
        return <AddCustomChainPage />;
      case MultichainScreen.SELECT_BLOCKCHAIN_PAGE:
        return <ChainSelectorPageComponent />;
      case MultichainScreen.ECOSYSTEM_PAGE:
        return <EcosystemComponent />;
      case MultichainScreen.SETTINGS_ABOUT:
        return <AboutPageComponent />;
      case MultichainScreen.SETTINGS_HELP:
      case HiveScreen.SETTINGS_HELP:
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
      case MultichainScreen.SETTINGS_SHORTCUTS:
        return <ShortcutsComponent />;
      case MultichainScreen.SETTINGS_CONTACTS:
        return <SettingsContactsPageComponent />;
      case MultichainScreen.SETTINGS_NETWORK:
        return <SettingsNetworkPageComponent />;
      case MultichainScreen.SETTINGS_CONNECTED_DAPPS:
        return <SettingsConnectedDappsPageComponent />;
      case MultichainScreen.SETTINGS_PREFERENCES_AND_DISPLAY:
        return <SettingsPreferencesDisplayPageComponent />;
      case MultichainScreen.SETTINGS_CHAIN_SETTINGS:
        return <SettingsChainSettingsPageComponent />;
      case MultichainScreen.SETTINGS_HELP_AND_ABOUT:
        return <SettingsHelpAndAboutPageComponent />;
      case MultichainScreen.SETTINGS_EVM:
        return <SettingsEvmPageComponent />;
      case MultichainScreen.SETTINGS_HIVE:
        return <SettingsHivePageComponent />;

      case HiveScreen.GOVERNANCE_PAGE:
        return <GovernanceComponent />;
      case Screen.RECURRENT_TRANSFERS_PAGE:
        return <PendingRecurrentTransfersPageComponent />;
      case Screen.POWER_UP_PAGE:
      case HiveScreen.POWER_DOWN_PAGE:
        return <PowerUpDownComponent />;
      case HiveScreen.WALLET_HISTORY_PAGE:
        return <WalletHistoryComponent />;
      case HiveScreen.CONVERSION_PAGE:
        return <ConversionComponent />;
      case Screen.PENDING_CONVERSION_PAGE:
        return <PendingConversionPageComponent />;
      case Screen.SAVINGS_PAGE:
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
      case HiveScreen.TOKENS_PENDING_UNSTAKE:
        return <TokenPendingUnstakePage />;
      case HiveScreen.SETTINGS_MAIN_PAGE:
        return <UnifiedSettingsMainPageComponent />;
      case HiveScreen.SETTINGS_ACCOUNTS:
        return <AccountSubMenuComponent />;
      case HiveScreen.ACCOUNT_PAGE_INIT_ACCOUNT:
        return <AddAccountRouterComponent />;
      case HiveScreen.ACCOUNT_PAGE_ADD_BY_KEYS:
        return <AddByKeysComponent />;
      case Screen.ACCOUNT_PAGE_KEYLESS_KEYCHAIN:
        return <KeylessKeychainComponent />;
      case Screen.ACCOUNT_PAGE_ADD_BY_AUTH:
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
      case Screen.SETTINGS_IMPORT_EXPORT:
        return <ImportExportPreferencesComponent />;
      case HiveScreen.SETTINGS_USER_PREFERENCES:
        return <SettingsHivePageComponent />;
      case HiveScreen.SETTINGS_AUTHORIZED_OPERATIONS:
        return <SettingsConnectedDappsPageComponent />;
      case HiveScreen.SETTINGS_EXPORT_TRANSACTIONS:
        return <ExportTransactionsComponent />;
      case HiveScreen.SETTINGS_OPERATION_POPUP:
        return <SettingsHivePageComponent />;
      case HiveScreen.SETTINGS_AUTOMATED_TASKS:
        return <AutomatedTasksComponent />;
      case HiveScreen.SETTINGS_FAVORITE_ACCOUNTS:
        return <SettingsContactsPageComponent />;
      case HiveScreen.SETTINGS_NOTIFICATIONS_CONFIGURATION:
        return <NotificationsConfigComponent />;
      case HiveScreen.SETTINGS_MULTISIG:
        return <MultisigComponent />;
      case HiveScreen.CREATE_ACCOUNT_PAGE_STEP_ONE:
        return <CreateAccountStepOneComponent />;
      case HiveScreen.CREATE_ACCOUNT_PAGE_STEP_TWO:
        return <CreateAccountStepTwoComponent />;

      case EvmScreen.EVM_ADD_WALLET_MAIN:
        return <AddWalletMainComponent />;
      case EvmScreen.IMPORT_EVM_WALLET:
        return <ImportWalletFromSeedComponent />;
      case EvmScreen.IMPORT_EVM_WALLET_FROM_KEY:
        return <ImportWalletFromKeyComponent />;
      case EvmScreen.IMPORT_EVM_WALLET_CONFIRMATION:
        return <ImportWalletConfirmationComponent />;
      case EvmScreen.CREATE_EVM_WALLET:
        return <CreateNewWalletComponent />;
      case EvmScreen.CREATE_EVM_WALLET_VERIFICATION:
        return <CreateNewWalletVerificationComponent />;
      case EvmScreen.LIFI_CONFIRMATION_PAGE:
        return <LiFiConfirmationPageComponent />;
      case EvmScreen.LIFI_HISTORY_PAGE:
        return <LiFiHistoryPageComponent />;
      case EvmScreen.EVM_RECEIVE_PAGE:
        return <EvmReceiveComponent />;
      case EvmScreen.EVM_TRANSFER_RESULT_PAGE:
        return <EvmTransactionResultComponent />;
      case EvmScreen.EVM_NFT_COLLECTION_PAGE:
        return <EvmNftCollectionPageComponent />;
      case EvmScreen.EVM_NFT_ALL_NFTS_PAGE:
        return <EvmNftAllCollectionsPageComponent />;
      case EvmScreen.EVM_NFT_TRANSFER_PAGE:
        return <EvmNFTTransferComponent />;
      case EvmScreen.EVM_SETTINGS:
        return <UnifiedSettingsMainPageComponent />;
      case EvmScreen.EVM_ACCOUNTS_SETTINGS:
        return <EvmAccountsComponent />;
      case EvmScreen.EVM_ADVANCED_SETTINGS:
        return <SettingsEvmPageComponent />;
      case EvmScreen.EVM_CONTACTS:
        return <SettingsContactsPageComponent />;
      case EvmScreen.EVM_CUSTOM_CHAINS:
        return <EvmCustomChainsComponent />;
      case EvmScreen.EVM_DAPPS_CONNECTIONS:
        return <SettingsConnectedDappsPageComponent />;
      case EvmScreen.EVM_CUSTOM_TOKENS_PAGE:
        return <EvmCustomTokensPageComponent />;
      case EvmScreen.EVM_CUSTOM_NFTS_PAGE:
        return <EvmCustomNftsPageComponent />;
      case EvmScreen.EVM_RPC_NODES_SETTINGS:
        return <SettingsNetworkPageComponent />;
      case EvmScreen.EVM_SECURITY_SETTINGS:
        return <SettingsEvmPageComponent />;
      case EvmScreen.EVM_PROVIDER_SETTINGS:
        return <SettingsEvmPageComponent />;
      default:
        return null;
    }
  };

  return (
    <div
      className="app-router"
      style={{
        height: '100%',
        display: 'grid',
        gridTemplateRows: hasTitle ? '80px 1fr' : '1fr',
      }}>
      {hasTitle && <PageTitleComponent {...titleProperties}></PageTitleComponent>}
      <div
        className="page-content"
        style={{
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}>
        {renderPage(currentPage!)}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccountType: state.activeAccountType,
    currentPage: state.navigation.stack[0]
      ? state.navigation.stack[0].currentPage
      : Screen.UNDEFINED,
    navigationParams: state.navigation.stack[0]?.params,
    hasTitle: state.titleContainer?.title.length > 0,
    titleProperties: state.titleContainer,
  };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const UnifiedRouterComponent = connector(UnifiedRouter);
