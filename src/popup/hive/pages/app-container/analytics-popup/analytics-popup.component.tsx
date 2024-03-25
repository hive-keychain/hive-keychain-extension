import React, { useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import CheckboxComponent from 'src/common-ui/checkbox/checkbox/checkbox.component';
import { PopupContainer } from 'src/common-ui/popup-container/popup-container.component';
import {
  setErrorMessage,
  setSuccessMessage,
} from 'src/popup/hive/actions/message.actions';
import { RootState } from 'src/popup/hive/store';

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
    // AnalyticsUtils.acceptAll();
    setSuccessMessage('popup_html_analytics_thank_you');
    onAnswered();
  };
  const reject = () => {
    // AnalyticsUtils.rejectAll();
    onAnswered();
  };

  return (
    <PopupContainer className={`analytics-popup`}>
      <div className="popup-title">
        {chrome.i18n.getMessage('popup_html_analytics_title')}
      </div>
      <div className="caption">
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
        <a
          className="privacy-policy-link"
          href="https://hive-keychain.com/#/privacy"
          target="__blank">
          {chrome.i18n.getMessage('popup_html_analytics_privacy_policy')}
        </a>
      </div>
      <div className="popup-footer">
        <ButtonComponent onClick={save} label={'popup_html_analytics_save'} />
      </div>
    </PopupContainer>
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
