import {HomeComponent} from '@popup/pages/app-container/home/home.component';
import {SettingsMainPageComponent} from '@popup/pages/app-container/settings/settings-main-page/settings-main-page.component';
import {RootState} from '@popup/store';
import React from 'react';
import {connect, ConnectedProps} from 'react-redux';
import {Screen} from 'src/reference-data/screen.enum';

const AppRouter = ({currentPage}: PropsFromRedux) => {
  const renderAccountPage = (page: Screen) => {
    switch (page) {
      case Screen.HOME_PAGE:
        return <HomeComponent />;
      case Screen.SETTINGS_ROUTER:
        return <SettingsMainPageComponent />;
    }
  };

  return (
    <div className="add-account-router-page">
      {renderAccountPage(currentPage)}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {currentPage: state.navigation.currentPage};
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const AppRouterComponent = connector(AppRouter);
