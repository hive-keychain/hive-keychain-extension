import { AddWalletMainComponent } from '@popup/evm/pages/add-wallets/add-wallets-main.component';
import { CreateNewWalletVerificationComponent } from '@popup/evm/pages/add-wallets/create-new-wallet/create-new-wallet-verification.component';
import { CreateNewWalletComponent } from '@popup/evm/pages/add-wallets/create-new-wallet/create-new-wallet.component';
import { ImportWalletConfirmationComponent } from '@popup/evm/pages/add-wallets/import-wallet-from-seed/import-wallet-confirmation.component';
import { ImportWalletFromSeedComponent } from '@popup/evm/pages/add-wallets/import-wallet-from-seed/import-wallet-from-seed.component';
import { RootState } from '@popup/multichain/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import { Screen } from 'src/reference-data/screen.enum';

const EvmAppRouter = ({
  currentPage,
  titleProperties,
  hasTitle,
}: PropsFromRedux) => {
  const renderAccountPage = (page: Screen) => {
    switch (page) {
      case Screen.EVM_ADD_WALLET_MAIN:
        return <AddWalletMainComponent />;
      case Screen.IMPORT_EVM_WALLET:
        return <ImportWalletFromSeedComponent />;
      case Screen.IMPORT_EVM_WALLET_CONFIRMATION:
        return <ImportWalletConfirmationComponent />;
      case Screen.CREATE_EVM_WALLET:
        return <CreateNewWalletComponent />;
      case Screen.CREATE_EVM_WALLET_VERIFICATION:
        return <CreateNewWalletVerificationComponent />;
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

export const EvmRouterComponent = connector(EvmAppRouter);
