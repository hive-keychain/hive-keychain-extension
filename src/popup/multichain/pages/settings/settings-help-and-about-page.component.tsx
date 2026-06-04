import { Screen } from '@interfaces/screen.interface';
import { RootState } from '@popup/multichain/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { MenuComponent } from 'src/common-ui/menu/menu.component';
import { getSettingsHelpAndAboutMenuItems } from 'src/popup/multichain/pages/settings/settings-help-and-about-menu-items';

const SettingsHelpAndAboutPage = ({}: PropsFromRedux) => {
  return (
    <div
      data-testid={`${Screen.SETTINGS_HELP_AND_ABOUT}-page`}
      className="settings-help-and-about-page">
      <MenuComponent
        title="popup_html_help_and_about"
        isBackButtonEnable={true}
        menuItems={getSettingsHelpAndAboutMenuItems()}
      />
    </div>
  );
};

const connector = connect((state: RootState) => ({}));

type PropsFromRedux = ConnectedProps<typeof connector>;

export const SettingsHelpAndAboutPageComponent = connector(
  SettingsHelpAndAboutPage,
);
