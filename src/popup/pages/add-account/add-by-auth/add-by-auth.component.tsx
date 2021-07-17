import { addAccount } from '@popup/actions/account.actions';
import { setErrorMessage } from '@popup/actions/error-message.actions';
import { navigateTo } from '@popup/actions/navigation.actions';
import { RootState } from '@popup/store';
import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import { Screen } from 'src/reference-data/screen.enum';
import AccountUtils from 'src/utils/account.utils';
import KeysUtils from 'src/utils/keys.utils';
import './add-by-auth.component.css';

const AddByAuth = ({
  setErrorMessage,
  navigateTo,
  localAccounts,
  addAccount,
}: PropsType) => {
  const [username, setUsername] = useState('');
  const [authorizedAccount, setAuthorizedAccount] = useState('');

  const submitForm = async (): Promise<void> => {
    const keys = await AccountUtils.addAuthorizedAccount(
      username,
      authorizedAccount,
      localAccounts,
      setErrorMessage,
    );

    if (keys && KeysUtils.keysCount(keys) >= 2) {
      addAccount({ name: username, keys: keys });
      navigateTo(Screen.SETTINGS_MAIN_PAGE);
    }
  };

  return (
    <div className="add-by-auth-page">
      <PageTitleComponent title="popup_html_setup" isBackButtonEnabled={true} />
      <div
        className="caption"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('popup_html_auth_text'),
        }}></div>
      <div className="form-container">
        <InputComponent
          value={username}
          onChange={setUsername}
          logo="arobase"
          placeholder="popup_html_username"
          type={InputType.TEXT}
        />
        <InputComponent
          value={authorizedAccount}
          onChange={setAuthorizedAccount}
          logo="arobase"
          placeholder="popup_html_auth_placeholder_username_auth"
          type={InputType.TEXT}
        />
        <ButtonComponent label={'popup_html_submit'} onClick={submitForm} />
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    localAccounts: state.accounts,
  };
};

const connector = connect(mapStateToProps, {
  setErrorMessage,
  navigateTo,
  addAccount,
});
type PropsType = ConnectedProps<typeof connector>;

export const AddByAuthComponent = connector(AddByAuth);
