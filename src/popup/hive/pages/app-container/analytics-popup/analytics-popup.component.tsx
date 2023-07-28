import React, { useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { AnalyticsUtils } from 'src/analytics/analytics.utils';
import ButtonComponent from 'src/common-ui/button/button.component';
import CheckboxComponent from 'src/common-ui/checkbox/checkbox/checkbox.component';
import {
  setErrorMessage,
  setSuccessMessage,
} from 'src/popup/hive/actions/message.actions';
import { RootState } from 'src/popup/hive/store';
import './analytics-popup.component.scss';

interface Props {
  onAnswered: any;
}

const AnalyticsPopup = ({
  onAnswered,
  setSuccessMessage,
}: PropsFromRedux & Props) => {
  const [accepted, setAccepted] = useState(true);

  const save = () => {
    if (accepted) {
      accept();
    } else {
      reject();
    }
  };

  const accept = () => {
    AnalyticsUtils.acceptAll();
    setSuccessMessage('popup_html_analytics_thank_you');
    onAnswered();
  };
  const reject = () => {
    AnalyticsUtils.rejectAll();
    onAnswered();
  };

  return (
    <div
      data-testid="analytics-popup"
      className={`analytics-popup 
        `}>
      <div className="overlay"></div>
      <div className="popup-container">
        <div className="why-analytics">
          {chrome.i18n.getMessage('popup_html_analytics_title')}
        </div>
        <div className="text">
          {chrome.i18n.getMessage('popup_html_analytics_message')}
        </div>
        <CheckboxComponent
          onChange={() => setAccepted(!accepted)}
          checked={accepted}
          title="popup_html_analytics_accept_to_share"
        />
        <div className="pp">
          {chrome.i18n.getMessage('popup_html_analytics_privacy_policy_text') +
            ' '}
          <a href="https://hive-keychain.com/#/privacy" target="__blank">
            {chrome.i18n.getMessage('popup_html_analytics_privacy_policy')}
          </a>
        </div>
        <div className="buttons-panel">
          <ButtonComponent onClick={save} label={'popup_html_analytics_save'} />
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {
  setSuccessMessage,
  setErrorMessage,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const AnalyticsPopupComponent = connector(AnalyticsPopup);
