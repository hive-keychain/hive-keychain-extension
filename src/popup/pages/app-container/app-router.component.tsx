import { AddAccountRouterComponent } from '@popup/pages/add-account/add-account-router/add-account-router.component';
import { AddByAuthComponent } from '@popup/pages/add-account/add-by-auth/add-by-auth.component';
import { AddByKeysComponent } from '@popup/pages/add-account/add-by-keys/add-by-keys.component';
import { ImportKeysComponent } from '@popup/pages/add-account/import-keys/import-keys.component';
import { SelectKeysComponent } from '@popup/pages/add-account/select-keys/select-keys.component';
import { HomeComponent } from '@popup/pages/app-container/home/home.component';
import { SettingsMainPageComponent } from '@popup/pages/app-container/settings/settings-main-page/settings-main-page.component';
import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Screen } from 'src/reference-data/screen.enum';

const AppRouter = ({ currentPage }: PropsFromRedux) => {
  const renderAccountPage = (page: Screen) => {
    switch (page) {
      case Screen.HOME_PAGE:
        return <HomeComponent />;
      //Settings Routes
      case Screen.SETTINGS_MAIN_PAGE:
        return <SettingsMainPageComponent />;
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
