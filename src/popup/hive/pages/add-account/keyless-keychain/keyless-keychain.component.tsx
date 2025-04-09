import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { setAccounts } from 'src/popup/hive/actions/account.actions';
import { Screen } from 'src/reference-data/screen.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const KeylessKeychain = ({ navigateTo }: PropsFromRedux) => {
  const handleLeaveKeylessKeychain = async () => {
    await LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.KEYLESS_KEYCHAIN_ENABLED,
      false,
    );
    navigateTo(Screen.ACCOUNT_PAGE_INIT_ACCOUNT, true);
  };
  return (
    <div
      data-testid={`${Screen.ACCOUNT_PAGE_KEYLESS_KEYCHAIN}-page`}
      className="keyless-keychain-page">
      <div className="content">
        <div
          className="caption"
          dangerouslySetInnerHTML={{
            __html: chrome.i18n.getMessage('popup_html_keyless_keychain_setup'),
          }}></div>
      </div>

      <div className="button-container">
        <ButtonComponent
          dataTestId="submit-button"
          label={'popup_html_keyless_keychain_leave_button'}
          onClick={handleLeaveKeylessKeychain}
        />
      </div>
    </div>
  );
};
const mapStateToProps = (state: RootState) => {
  return {
    accounts: state.hive.accounts,
  };
};

const connector = connect(mapStateToProps, {
  navigateTo,
  setAccounts,
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const KeylessKeychainComponent = connector(KeylessKeychain);
