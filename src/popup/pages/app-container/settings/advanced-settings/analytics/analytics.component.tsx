import { AnalyticsSettings } from '@interfaces/analytics.interface';
import { setSuccessMessage } from '@popup/actions/message.actions';
import { goBack } from '@popup/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { RootState } from '@popup/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { AnalyticsUtils } from 'src/analytics/analytics.utils';
import ButtonComponent from 'src/common-ui/button/button.component';
import CheckboxComponent from 'src/common-ui/checkbox/checkbox.component';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import './analytics.component.scss';

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
      aria-label="analytics-settings-page"
      className="analytics-settings-page">
      <CheckboxComponent
        ariaLabel={`checkbox-allow-ga`}
        title="popup_html_analytics_allow_ga"
        hint="popup_html_analytics_allow_ga_hint"
        checked={allowGoogleAnalytics}
        onChange={() => {
          setAllowGoogleAnalytics(!allowGoogleAnalytics);
        }}></CheckboxComponent>

      <ButtonComponent
        ariaLabel="button-save"
        label={'popup_html_save'}
        onClick={() => save()}
        fixToBottom
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
