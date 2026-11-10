import { Screen } from '@interfaces/screen.interface';
import { AddEvmAccountsFromLedgerComponent } from '@popup/evm/pages/add-wallets/add-evm-accounts-from-ledger.component';
import { CreateNewWalletVerificationComponent } from '@popup/evm/pages/add-wallets/create-new-wallet/create-new-wallet-verification.component';
import { CreateNewWalletComponent } from '@popup/evm/pages/add-wallets/create-new-wallet/create-new-wallet.component';
import { ImportWalletFromKeyComponent } from '@popup/evm/pages/add-wallets/import-wallet-from-key/import-wallet-from-key.component';
import { ImportWalletConfirmationComponent } from '@popup/evm/pages/add-wallets/import-wallet-from-seed/import-wallet-confirmation.component';
import { ImportWalletFromSeedComponent } from '@popup/evm/pages/add-wallets/import-wallet-from-seed/import-wallet-from-seed.component';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import { KeylessKeychainComponent } from '@popup/hive/pages/add-account/keyless-keychain/keyless-keychain.component';
import { HiveScreen } from '@popup/hive/reference-data/hive-screen.enum';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import { RootState } from '@popup/multichain/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { AddByAuthComponent } from 'src/popup/hive/pages/add-account/add-by-auth/add-by-auth.component';
import { SelectKeysComponent } from 'src/popup/hive/pages/add-account/select-keys/select-keys.component';
import { CreateAccountStepOneComponent } from 'src/popup/hive/pages/app-container/settings/accounts/create-account/create-account-step-one/create-account-step-one.component';
import { CreateAccountStepTwoComponent } from 'src/popup/hive/pages/app-container/settings/accounts/create-account/create-account-step-two/create-account-step-two.component';
import { PendingAccountCreationPaymentComponent } from 'src/popup/hive/pages/app-container/settings/accounts/create-account/pending-account-creation-payment/pending-account-creation-payment.component';
import { AddAccountsFromLedgerComponent } from 'src/popup/hive/pages/ledger/add-accounts-from-ledger.component';
import { AddAccountMainComponent } from '../add-account-main/add-account-main.component';
import { AddByKeysComponent } from '../add-by-keys/add-by-keys.component';
import { ImportKeysComponent } from '../import-keys/import-keys.component';

const AddAccountRouter = ({ currentPage }: PropsFromRedux) => {
  const renderAccountPage = (page: Screen) => {
    switch (page) {
      case Screen.ACCOUNT_PAGE_INIT_ACCOUNT:
        return <AddAccountMainComponent />;
      case Screen.ACCOUNT_PAGE_ADD_BY_KEYS:
        return <AddByKeysComponent />;
      case Screen.ACCOUNT_PAGE_ADD_BY_AUTH:
        return <AddByAuthComponent />;
      case Screen.ACCOUNT_PAGE_IMPORT_KEYS:
        return <ImportKeysComponent />;
      case Screen.ACCOUNT_PAGE_SELECT_KEYS:
        return <SelectKeysComponent />;
      case Screen.ACCOUNT_PAGE_KEYLESS_KEYCHAIN:
        return <KeylessKeychainComponent />;
      case HiveScreen.ACCOUNT_PAGE_ADD_ACCOUNTS_FROM_LEDGER:
        return <AddAccountsFromLedgerComponent />;
      case HiveScreen.CREATE_ACCOUNT_PAGE_STEP_ONE:
        return <CreateAccountStepOneComponent />;
      case HiveScreen.CREATE_ACCOUNT_PAGE_STEP_TWO:
        return <CreateAccountStepTwoComponent />;
      case HiveScreen.PENDING_ACCOUNT_CREATION_PAYMENT:
        return <PendingAccountCreationPaymentComponent />;
      case EvmScreen.EVM_ADD_ACCOUNTS_FROM_LEDGER:
        return <AddEvmAccountsFromLedgerComponent />;
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
      default:
        return null;
    }
  };

  return (
    <div
      data-testid={'add-account-router-page'}
      className="add-account-router-page"
      style={{
        height: '100%',
        display: 'grid',
        gridTemplateRows: '1fr',
      }}>
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
    params: state.navigation.stack[0] ? state.navigation.stack[0].params : {},
  };
};

const connector = connect(mapStateToProps, {
  navigateTo,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const AddAccountRouterComponent = connector(AddAccountRouter);
