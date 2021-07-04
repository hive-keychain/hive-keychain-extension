import {resetAccount} from '@popup/actions/account.actions';
import {forgetMk} from '@popup/actions/mk.actions';
import {navigateTo} from '@popup/actions/navigation.actions';
import {RootState} from '@popup/store';
import React from 'react';
import {connect, ConnectedProps} from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import {PageTitleComponent} from 'src/common-ui/page-title/page-title.component';
import {Screen} from 'src/reference-data/screen.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const ResetPasswordPage = ({
  forgetMk,
  resetAccount,
  navigateTo,
}: PropsFromRedux) => {
  const reset = () => {
    forgetMk();
    resetAccount();
    LocalStorageUtils.clearLocalStorage();
    navigateTo(Screen.SIGN_UP_PAGE);
  };

  return (
    <div className="reset-password-page">
      <PageTitleComponent
        title="popup_html_reset"
        isBackButtonEnabled={true}
        backScreen={Screen.SIGN_IN_PAGE}
      />

      <p
        className="introduction"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('popup_html_reset_desc'),
        }}></p>

      <ButtonComponent label="popup_html_confirm" onClick={() => reset()} />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {
  forgetMk,
  resetAccount,
  navigateTo,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ResetPasswordPageComponent = connector(ResetPasswordPage);
