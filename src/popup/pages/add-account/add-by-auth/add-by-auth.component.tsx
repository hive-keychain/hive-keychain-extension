import { LocalAccount } from '@interfaces/local-account.interface';
import { addAccount } from '@popup/actions/account.actions';
import { setErrorMessage } from '@popup/actions/message.actions';
import { navigateTo } from '@popup/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { Screen } from 'src/reference-data/screen.enum';
import AccountUtils from 'src/utils/account.utils';
import { KeysUtils } from 'src/utils/keys.utils';
import './add-by-auth.component.scss';

const AddByAuth = ({
  setErrorMessage,
  navigateTo,
  localAccounts,
  addAccount,
  setTitleContainerProperties,
}: PropsType) => {
  const [username, setUsername] = useState('');
  const [authorizedAccount, setAuthorizedAccount] = useState('');

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_setup',
      isBackButtonEnabled: true,
    });
  });

  const submitForm = async (): Promise<void> => {
    if (
      localAccounts
        .map((localAccount: LocalAccount) => localAccount.name)
        .includes(username)
    ) {
      setErrorMessage('popup_html_account_already_existing');
      return;
    }
    try {
      const keys = await AccountUtils.addAuthorizedAccount(
        username.trim(),
        authorizedAccount.trim(),
        localAccounts,
      );
      if (keys && KeysUtils.keysCount(keys) >= 2) {
        addAccount({ name: username, keys: keys });
        navigateTo(Screen.SETTINGS_MAIN_PAGE);
      }
    } catch (err: any) {
      //TODO add type
      setErrorMessage(err.message, err.messageParams);
    }
  };

  return (
    <div
      aria-label={`${Screen.ACCOUNT_PAGE_ADD_BY_AUTH}-page`}
      className="add-by-auth-page">
      <div
        className="caption"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('popup_html_auth_text'),
        }}></div>
      <InputComponent
        ariaLabel="input-username"
        value={username}
        onChange={setUsername}
        logo={Icons.AT}
        placeholder="popup_html_username"
        type={InputType.TEXT}
        onEnterPress={submitForm}
      />
      <InputComponent
        ariaLabel="input-authorized-account"
        value={authorizedAccount}
        onChange={setAuthorizedAccount}
        logo={Icons.AT}
        placeholder="popup_html_auth_placeholder_username_auth"
        type={InputType.TEXT}
        onEnterPress={submitForm}
      />
      <ButtonComponent
        ariaLabel="submit-button"
        label={'popup_html_submit'}
        onClick={submitForm}
        fixToBottom
      />
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
  setTitleContainerProperties,
});
type PropsType = ConnectedProps<typeof connector>;

export const AddByAuthComponent = connector(AddByAuth);
