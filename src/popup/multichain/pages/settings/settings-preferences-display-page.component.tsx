import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { DisplayAppearancePreferencesComponent } from 'src/popup/multichain/pages/settings/display-appearance-preferences.component';

const SettingsPreferencesDisplayPage = ({
  setTitleContainerProperties,
}: PropsFromRedux) => {
  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_preferences_and_display',
      isBackButtonEnabled: true,
      isCloseButtonDisabled: false,
    });
  }, [setTitleContainerProperties]);

  return (
    <div
      data-testid="settings-preferences-display-content-page"
      className="settings-preferences-display-page">
      <div className="fields">
        <DisplayAppearancePreferencesComponent />
      </div>
    </div>
  );
};

const connector = connect((state: RootState) => ({}), {
  setTitleContainerProperties,
});

type PropsFromRedux = ConnectedProps<typeof connector>;

export const SettingsPreferencesDisplayPageComponent = connector(
  SettingsPreferencesDisplayPage,
);
