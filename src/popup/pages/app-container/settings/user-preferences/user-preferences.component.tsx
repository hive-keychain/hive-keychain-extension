import UserPreferencesMenuItems from '@popup/pages/app-container/settings/user-preferences/user-preferences-menu-items';
import { RootState } from '@popup/store';
import { Screen } from '@reference-data/screen.enum';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { MenuComponent } from 'src/common-ui/menu/menu.component';
import './user-preferences.component.scss';

const UserPreferencesPage = ({}: PropsFromRedux) => {
  return (
    <div
      aria-label={`${Screen.SETTINGS_USER_PREFERENCES}-page`}
      className="user-preferences-page">
      <MenuComponent
        title="popup_html_user_preferences"
        isBackButtonEnable={true}
        menuItems={UserPreferencesMenuItems}></MenuComponent>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const UserPreferencesPageComponent = connector(UserPreferencesPage);
