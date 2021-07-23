import { navigateTo } from '@popup/actions/navigation.actions';
import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import AdvancedSettingsMenuItems from './advanced-settings-menu-items';
import './advanced-settings.component.scss';

const AdvancedSettingsPage = ({ navigateTo }: PropsFromRedux) => {
  return (
    <div className="advanced-settings-page">
      <PageTitleComponent
        title="popup_html_advanced_settings"
        isBackButtonEnabled={true}
      />
      <div className="menu">
        {AdvancedSettingsMenuItems.map((menuItem, index) => (
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

export const AdvancedSettingsPageComponent = connector(AdvancedSettingsPage);
