import { navigateTo } from '@popup/actions/navigation.actions';
import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import SettingsMenuItems from './settings-main-page-menu-items';
import './settings-main-page.component.scss';

const SettingsMainPage = ({ navigateTo }: PropsFromRedux) => {
  return (
    <div className="settings-main-page">
      <PageTitleComponent
        title="popup_html_settings"
        isBackButtonEnabled={true}
      />
      <div className="menu">
        {SettingsMenuItems.map((menuItem, index) => (
          <div
            key={index}
            className="menu-item"
            onClick={() => navigateTo(menuItem.nextScreen)}>
            <img className="icon" src={`/assets/images/${menuItem.icon}.png`} />
            <div className="menu-label">
              {chrome.i18n.getMessage(menuItem.label)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, { navigateTo });
type PropsFromRedux = ConnectedProps<typeof connector>;

export const SettingsMainPageComponent = connector(SettingsMainPage);
