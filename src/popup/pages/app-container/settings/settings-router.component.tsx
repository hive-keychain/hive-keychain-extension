import { navigateTo } from '@popup/actions/navigation.actions';
import { AddByAuthComponent } from '@popup/pages/add-account/add-by-auth/add-by-auth.component';
import { AddByKeysComponent } from '@popup/pages/add-account/add-by-keys/add-by-keys.component';
import { ImportKeysComponent } from '@popup/pages/add-account/import-keys/import-keys.component';
import { SelectKeysComponent } from '@popup/pages/add-account/select-keys/select-keys.component';
import { SettingsAddAccountMainComponent } from '@popup/pages/app-container/settings/settings-main-page/settings-add-account-main/settings-add-account-main.component';
import { SettingsMainPageComponent } from '@popup/pages/app-container/settings/settings-main-page/settings-main-page.component';
import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Screen } from 'src/reference-data/screen.enum';

const SettingsRouter = ({ secondaryPage }: PropsFromRedux) => {
  const renderAccountPage = (page: Screen) => {
    switch (page) {
      case Screen.SETTINGS_MAIN_PAGE:
        return <SettingsMainPageComponent />;
      case Screen.SETTINGS_ADD_ACCOUNT:
        return <SettingsAddAccountMainComponent />;
      case Screen.ACCOUNT_PAGE_ADD_BY_KEYS:
        return (
          <AddByKeysComponent
            backEnabled={true}
            backPage={Screen.SETTINGS_ROUTER}
            backSecondaryPage={Screen.SETTINGS_ADD_ACCOUNT}
          />
        );
      case Screen.ACCOUNT_PAGE_ADD_BY_AUTH:
        return (
          <AddByAuthComponent
            backEnabled={true}
            backPage={Screen.SETTINGS_ROUTER}
            backSecondaryPage={Screen.SETTINGS_ADD_ACCOUNT}
          />
        );
      case Screen.ACCOUNT_PAGE_IMPORT_KEYS:
        return <ImportKeysComponent />;
      case Screen.ACCOUNT_PAGE_SELECT_KEYS:
        return <SelectKeysComponent />;
    }
  };

  return (
    <div className="settings-router-page">
      {secondaryPage && renderAccountPage(secondaryPage)}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return { secondaryPage: state.navigation.secondaryPage };
};

const connector = connect(mapStateToProps, { navigateTo });
type PropsFromRedux = ConnectedProps<typeof connector>;

export const SettingsRouterComponent = connector(SettingsRouter);
