import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/actions/message.actions';
import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { AnalyticsUtils } from 'src/analytics/analytics.utils';
import ButtonComponent from 'src/common-ui/button/button.component';
import './analytics-popup.component.scss';

interface Props {
  onAnswered: any;
}

const AnalyticsPopup = ({
  onAnswered,
  setSuccessMessage,
}: PropsFromRedux & Props) => {
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
      aria-label="analytics-popup"
      className={`analytics-popup 
        `}>
      <div className="overlay"></div>
      <div className="popup-container">
        <div className="why-analytics">
          short explanation of why we need analytics
        </div>
        <div className="text">
          You can always change those settings going to Settings then Analytics
        </div>
        <div className="buttons-panel">
          <ButtonComponent
            onClick={accept}
            label={'popup_html_analytics_accept'}
          />
          <ButtonComponent
            onClick={reject}
            label={'popup_html_analytics_reject'}
          />
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
