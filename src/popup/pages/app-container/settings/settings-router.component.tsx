import {navigateTo} from '@popup/actions/navigation.actions';
import {SettingsMainPageComponent} from '@popup/pages/app-container/settings/settings-main-page/settings-main-page.component';
import {RootState} from '@popup/store';
import React from 'react';
import {connect, ConnectedProps} from 'react-redux';
import {Screen} from 'src/reference-data/screen.enum';

const SettingsRouter = ({secondaryPage}: PropsFromRedux) => {
  const renderAccountPage = (page: Screen) => {
    switch (page) {
      case Screen.SETTINGS_MAIN_PAGE:
        return <SettingsMainPageComponent />;
    }
  };

  return (
    <div className="settings-router-page">
      {secondaryPage && renderAccountPage(secondaryPage)}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {secondaryPage: state.navigation.secondaryPage};
};

const connector = connect(mapStateToProps, {navigateTo});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const SettingsRouterComponent = connector(SettingsRouter);
