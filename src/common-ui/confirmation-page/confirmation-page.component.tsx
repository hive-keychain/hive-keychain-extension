import { goBack } from '@popup/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { ConfirmationPageFields } from 'src/common-ui/confirmation-page/confirmation-field.interface';
import './confirmation-page.component.scss';

const ConfirmationPage = ({
  fields,
  message,
  afterConfirmAction,
  warningMessage,
  warningParams,
  skipWarningTranslation,
  title,
  skipTitleTranslation,
  timeoutParams,
  onCancelAction,
  goBack,
  setTitleContainerProperties,
}: PropsType) => {
  const [countDown, setCountDown] = useState<number | undefined>(
    timeoutParams?.duration,
  );
  let timer: NodeJS.Timer;
  useEffect(() => {
    setTitleContainerProperties({
      title: title ?? 'popup_html_confirm',
      skipTitleTranslation,
      isBackButtonEnabled: false,
      isCloseButtonDisabled: true,
    });
    if (countDown) {
      timer = setInterval(() => {
        decreaseCountdown();
      }, 1000);
    }
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countDown === 0) {
      goBack();
    }
  }, [countDown]);

  const decreaseCountdown = () => {
    setCountDown((previousCount) => previousCount! - 1);
  };

  const handleCancelClick = () => {
    if (onCancelAction) {
      onCancelAction();
    }
    goBack();
  };

  const hasField = fields && fields.length !== 0;

  return (
    <div className="confirmation-page" aria-label="confirmation-page">
      <div className="confirmation-top">
        <div
          className="introduction"
          dangerouslySetInnerHTML={{
            __html: message,
          }}></div>

        {warningMessage && (
          <div aria-label="warning-message" className="warning-message">
            {skipWarningTranslation
              ? warningMessage
              : chrome.i18n.getMessage(warningMessage, warningParams)}
          </div>
        )}
        {timeoutParams && countDown && (
          <div className="warning-message">
            {timeoutParams.skipTranslation
              ? timeoutParams.message
              : chrome.i18n.getMessage(
                  timeoutParams.message,
                  countDown.toString(),
                )}
          </div>
        )}
        {hasField && (
          <div className="fields">
            {fields.map((field) => (
              <div className="field" key={field.label}>
                <div className="label">
                  {chrome.i18n.getMessage(field.label)}
                </div>
                <div className="value">{field.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bottom-panel">
        <ButtonComponent
          ariaLabel="dialog_cancel-button"
          label={'dialog_cancel'}
          onClick={handleCancelClick}></ButtonComponent>
        <ButtonComponent
          ariaLabel="dialog_confirm-button"
          label={'popup_html_confirm'}
          onClick={afterConfirmAction}
          type={ButtonType.RAISED}></ButtonComponent>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    message: state.navigation.stack[0].params.message as string,
    fields: state.navigation.stack[0].params.fields as ConfirmationPageFields[],
    warningMessage: state.navigation.stack[0].params.warningMessage as string,
    warningParams: state.navigation.stack[0].params.warningParams,
    skipWarningTranslation:
      state.navigation.stack[0].params.skipWarningTranslation,
    afterConfirmAction: state.navigation.stack[0].params.afterConfirmAction,
    title: state.navigation.stack[0].params.title,
    skipTitleTranslation: state.navigation.stack[0].params.skipTitleTranslation,
    timeoutParams: state.navigation.stack[0].params.timeoutParams,
    onCancelAction: state.navigation.stack[0].params.onCancelAction,
  };
};

const connector = connect(mapStateToProps, {
  goBack,
  setTitleContainerProperties,
});
type PropsType = ConnectedProps<typeof connector>;

export const ConfirmationPageComponent = connector(ConfirmationPage);
