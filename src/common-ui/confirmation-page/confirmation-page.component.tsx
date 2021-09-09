import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import './confirmation-page.component.scss';

const ConfirmationPage = ({ message, afterConfirmAction }: PropsType) => {
  return (
    <div className="confirmation-page">
      <PageTitleComponent
        title={'popup_html_confirm'}
        isBackButtonEnabled={true}></PageTitleComponent>

      <p
        className="introduction"
        dangerouslySetInnerHTML={{
          __html: message,
        }}></p>

      <ButtonComponent
        label={'popup_html_confirm'}
        onClick={afterConfirmAction}></ButtonComponent>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    message: state.navigation.params.message as string,
    afterConfirmAction: state.navigation.params.afterConfirmAction,
  };
};

const connector = connect(mapStateToProps, {});
type PropsType = ConnectedProps<typeof connector>;

export const ConfirmationPageComponent = connector(ConfirmationPage);
