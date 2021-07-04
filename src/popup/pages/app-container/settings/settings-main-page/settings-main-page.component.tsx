import {RootState} from '@popup/store';
import React from 'react';
import {connect, ConnectedProps} from 'react-redux';
import {PageTitleComponent} from 'src/common-ui/page-title/page-title.component';
import {Screen} from 'src/reference-data/screen.enum';

const SettingsMainPage = ({}: PropsFromRedux) => {
  return (
    <div className="settings-main-page">
      <PageTitleComponent
        title="popup_html_settings"
        isBackButtonEnabled={true}
        backScreen={Screen.HOME_PAGE}
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const SettingsMainPageComponent = connector(SettingsMainPage);
