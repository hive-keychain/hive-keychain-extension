import { goBack } from '@popup/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { RootState } from '@popup/store';
import React, { useEffect } from 'react';
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
  goBack,
  setTitleContainerProperties,
}: PropsType) => {
  useEffect(() => {
    setTitleContainerProperties({
      title: title ?? 'popup_html_confirm',
      skipTitleTranslation,
      isBackButtonEnabled: false,
    });
  });
  const hasField = fields && fields.length !== 0;
  return (
    <div className="confirmation-page">
      <div className="confirmation-top">
        <div
          className="introduction"
          dangerouslySetInnerHTML={{
            __html: message,
          }}></div>

        {warningMessage && (
          <div className="warning-message">
            {skipWarningTranslation
              ? warningMessage
              : chrome.i18n.getMessage(warningMessage, warningParams)}
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
          label={'dialog_cancel'}
          onClick={goBack}></ButtonComponent>
        <ButtonComponent
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
  };
};

const connector = connect(mapStateToProps, {
  goBack,
  setTitleContainerProperties,
});
type PropsType = ConnectedProps<typeof connector>;

export const ConfirmationPageComponent = connector(ConfirmationPage);
