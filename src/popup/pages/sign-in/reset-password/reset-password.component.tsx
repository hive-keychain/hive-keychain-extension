import { navigateTo } from '@popup/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { RootState } from '@popup/store';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import AccountUtils from 'src/utils/account.utils';
import './reset-password.component.scss';

const ResetPasswordPage = ({
  setTitleContainerProperties,
  navigateTo,
}: PropsFromRedux) => {
  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_reset',
      isBackButtonEnabled: true,
    });
  }, []);

  const reset = () => {
    console.log('reset called!');
    AccountUtils.clearAllData();
    navigateTo(Screen.SIGN_UP_PAGE, true);
  };

  return (
    <div className="reset-password-page">
      <div className="confirmation-top">
        <p
          className="introduction"
          dangerouslySetInnerHTML={{
            __html: chrome.i18n.getMessage('popup_html_reset_desc'),
          }}></p>
      </div>

      <ButtonComponent
        ariaLabel="reset-password-confirm-button"
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

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  navigateTo,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ResetPasswordPageComponent = connector(ResetPasswordPage);
