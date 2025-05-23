import { KeylessKeychainComponent } from '@popup/hive/pages/add-account/keyless-keychain/keyless-keychain.component';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import { RootState } from '@popup/multichain/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import { SelectKeysComponent } from 'src/popup/hive/pages/add-account/select-keys/select-keys.component';
import { Screen } from 'src/reference-data/screen.enum';
import { AddAccountMainComponent } from '../add-account-main/add-account-main.component';
import { AddByKeysComponent } from '../add-by-keys/add-by-keys.component';
import { ImportKeysComponent } from '../import-keys/import-keys.component';
const AddAccountRouter = ({
  currentPage,
  titleProperties,
  hasTitle,
  navStack,
}: PropsFromRedux) => {
  const renderAccountPage = (page: Screen) => {
    switch (page) {
      case Screen.ACCOUNT_PAGE_INIT_ACCOUNT:
        return <AddAccountMainComponent />;
      case Screen.ACCOUNT_PAGE_ADD_BY_KEYS:
        return <AddByKeysComponent />;
      case Screen.ACCOUNT_PAGE_IMPORT_KEYS:
        return <ImportKeysComponent />;
      case Screen.ACCOUNT_PAGE_SELECT_KEYS:
        return <SelectKeysComponent />;
      case Screen.ACCOUNT_PAGE_KEYLESS_KEYCHAIN:
        return <KeylessKeychainComponent />;
    }
  };

  return (
    <div
      data-testid={'add-account-router-page'}
      className="add-account-router-page"
      style={{
        height: '100%',
        display: 'grid',
        gridTemplateRows:
          hasTitle &&
          navStack[navStack.length - 1].currentPage ===
            Screen.ACCOUNT_PAGE_INIT_ACCOUNT
            ? '70px 1fr'
            : '1fr',
      }}>
      {hasTitle &&
        navStack[navStack.length - 1].currentPage ===
          Screen.ACCOUNT_PAGE_INIT_ACCOUNT && (
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
    params: state.navigation.stack[0] ? state.navigation.stack[0].params : {},
    hasTitle: state.titleContainer?.title.length > 0,
    titleProperties: state.titleContainer,
    navStack: state.navigation.stack,
  };
};

const connector = connect(mapStateToProps, {
  navigateTo,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const AddAccountRouterComponent = connector(AddAccountRouter);
