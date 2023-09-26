import { AnalyticsSettings } from '@interfaces/analytics.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { AnalyticsUtils } from 'src/analytics/analytics.utils';
import ButtonComponent from 'src/common-ui/button/button.component';
import { CheckboxPanelComponent } from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import { setSuccessMessage } from 'src/popup/hive/actions/message.actions';
import { goBack } from 'src/popup/hive/actions/navigation.actions';
import { setTitleContainerProperties } from 'src/popup/hive/actions/title-container.actions';
import { RootState } from 'src/popup/hive/store';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const Analytics = ({
  setSuccessMessage,
  goBack,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [allowGoogleAnalytics, setAllowGoogleAnalytics] = useState(false);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_analytics',
      isBackButtonEnabled: true,
    });
    init();
  }, []);

  const init = async () => {
    const analytics: AnalyticsSettings =
      await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.ANALYTICS_SETTINGS,
      );

    setAllowGoogleAnalytics(analytics ? analytics.allowGoogleAnalytics : false);
  };

  const save = async () => {
    AnalyticsUtils.saveSettings({
      allowGoogleAnalytics: allowGoogleAnalytics,
    } as AnalyticsSettings);
    setSuccessMessage('popup_html_save_successful');
    if (allowGoogleAnalytics) {
      AnalyticsUtils.initializeGoogleAnalytics();
    }
    goBack();
  };

  return (
    <div
      data-testid={`${Screen.SETTINGS_ANALYTICS}-page`}
      className="analytics-settings-page">
      <CheckboxPanelComponent
        dataTestId={`checkbox-allow-ga`}
        title="popup_html_analytics_allow_ga"
        hint="popup_html_analytics_message"
        checked={allowGoogleAnalytics}
        onChange={() => {
          setAllowGoogleAnalytics(!allowGoogleAnalytics);
        }}></CheckboxPanelComponent>

      <ButtonComponent
        dataTestId="button-save"
        label={'popup_html_save'}
        onClick={() => save()}
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {
  setSuccessMessage,
  goBack,
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const AnalyticsComponent = connector(Analytics);
