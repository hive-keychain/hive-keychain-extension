import { Screen } from '@interfaces/screen.interface';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import { resetKeychain } from '@popup/multichain/actions/reset-keychain.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';

import { HtmlUtils } from 'src/utils/html.utils';
const ResetPasswordPage = ({
  setTitleContainerProperties,
  navigateTo,
  resetKeychain,
}: PropsFromRedux) => {
  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_reset',
      isBackButtonEnabled: true,
    });
  }, []);

  const reset = async () => {
    await resetKeychain();
    navigateTo(Screen.SIGN_UP_PAGE, true);
  };

  return (
    <div className="reset-password-page">
      <div className="confirmation-top">
        <p
          className="introduction"
          dangerouslySetInnerHTML={{
            __html: HtmlUtils.getSafeI18nHtml('popup_html_reset_desc'),
          }}></p>
      </div>

      <div className="fill-space"></div>

      <ButtonComponent
        dataTestId="reset-password-confirm-button"
        label="popup_html_confirm"
        onClick={() => reset()}
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
  resetKeychain,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ResetPasswordPageComponent = connector(ResetPasswordPage);
