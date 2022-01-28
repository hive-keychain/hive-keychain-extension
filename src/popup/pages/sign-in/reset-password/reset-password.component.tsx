import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import AccountUtils from 'src/utils/account.utils';
import './reset-password.component.scss';

const ResetPasswordPage = ({}: PropsFromRedux) => {
  const reset = () => {
    AccountUtils.clearAllData();
  };

  return (
    <div className="reset-password-page">
      <div className="confirmation-top">
        <PageTitleComponent
          title="popup_html_reset"
          isBackButtonEnabled={true}
          isCloseButtonDisabled={true}
        />

        <p
          className="introduction"
          dangerouslySetInnerHTML={{
            __html: chrome.i18n.getMessage('popup_html_reset_desc'),
          }}></p>
      </div>

      <ButtonComponent
        label="popup_html_confirm"
        onClick={() => reset()}
        fixToBottom
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ResetPasswordPageComponent = connector(ResetPasswordPage);
