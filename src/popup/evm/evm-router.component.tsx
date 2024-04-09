import { AddWalletMainComponent } from '@popup/evm/pages/add-account/add-wallet-main.component';
import { RootState } from '@popup/multichain/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import { Screen } from 'src/reference-data/screen.enum';

const EVMAppRouter = ({
  currentPage,
  titleProperties,
  hasTitle,
}: PropsFromRedux) => {
  const renderAccountPage = (page: Screen) => {
    switch (page) {
      case Screen.EVM_ADD_WALLET_MAIN:
        return <AddWalletMainComponent />;
      case Screen.CREATE_EVM_WALLET:
      case Screen.IMPORT_EVM_WALLET:
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

export const EVMRouterComponent = connector(EVMAppRouter);
