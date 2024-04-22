import { setHasFinishedSignup } from '@popup/multichain/actions/has-finished-signup.actions';
import { forgetMk } from '@popup/multichain/actions/mk.actions';
import {
  goBack,
  navigateTo,
} from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { resetAccount } from 'src/popup/hive/actions/account.actions';
import { resetActiveAccount } from 'src/popup/hive/actions/active-account.actions';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const ClearAllData = ({
  setTitleContainerProperties,
  navigateTo,
  goBack,
  resetAccount,
  forgetMk,
  resetActiveAccount,
  setHasFinishedSignup,
}: PropsFromRedux) => {
  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_clear',
      isBackButtonEnabled: true,
    });
  }, []);

  const reset = async () => {
    resetAccount();
    forgetMk();
    setHasFinishedSignup(false);
    resetActiveAccount();
    await LocalStorageUtils.clearLocalStorage();
    navigateTo(Screen.SIGN_UP_PAGE, true);
  };

  return (
    <div
      data-testid={`${Screen.SETTINGS_CLEAR_ALL_DATA}-page`}
      className="clear-all-data-page">
      <p
        className="introduction"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('popup_html_clear_all_data_desc'),
        }}></p>

      <div className="bottom-panel">
        <ButtonComponent
          dataTestId="dialog_cancel-button"
          label={'dialog_cancel'}
          onClick={goBack}
          type={ButtonType.ALTERNATIVE}></ButtonComponent>
        <ButtonComponent
          dataTestId="dialog_confirm-button"
          label={'popup_html_confirm'}
          onClick={() => reset()}
          type={ButtonType.IMPORTANT}></ButtonComponent>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  navigateTo,
  goBack,
  resetAccount,
  forgetMk,
  resetActiveAccount,
  setHasFinishedSignup,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ClearAllDataComponent = connector(ClearAllData);
