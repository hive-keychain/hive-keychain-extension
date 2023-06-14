import { LocalAccount } from '@interfaces/local-account.interface';
import { addAccount } from '@popup/actions/account.actions';
import { setErrorMessage } from '@popup/actions/message.actions';
import { navigateToWithParams } from '@popup/actions/navigation.actions';
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
import './add-by-keys.component.scss';

const AddByKeys = ({
  navigateToWithParams,
  localAccounts,
  addAccount,
  setTitleContainerProperties,
  setErrorMessage,
}: PropsType) => {
  const [username, setUsername] = useState('');
  const [privateKey, setPrivateKey] = useState('');

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_setup',
      isBackButtonEnabled: true,
      isCloseButtonDisabled: localAccounts.length === 0,
    });
  }, []);

  const submitForm = async (): Promise<void> => {
    if (
      localAccounts
        .map((localAccount: LocalAccount) => localAccount.name)
        .includes(username)
    ) {
      setErrorMessage('popup_html_account_already_existing');
      return;
    }
    let keys;
    try {
      keys = await AccountUtils.verifyAccount(
        username.trim(),
        privateKey.trim(),
        localAccounts,
      );
    } catch (err: any) {
      setErrorMessage(err.message);
    }

    if (!keys) {
      return;
    }

    if (KeysUtils.keysCount(keys) > 2) {
      navigateToWithParams(Screen.ACCOUNT_PAGE_SELECT_KEYS, { keys, username });
    } else {
      addAccount({ name: username, keys: keys });
    }
  };

  return (
    <div
      aria-label={`${Screen.ACCOUNT_PAGE_ADD_BY_KEYS}-page`}
      className="add-by-keys-page">
      <div
        className="caption"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('popup_html_setup_text'),
        }}></div>
      <div className="form-container">
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
          ariaLabel="input-private-key"
          value={privateKey}
          onChange={setPrivateKey}
          logo={Icons.KEY}
          placeholder="popup_html_private_key"
          type={InputType.PASSWORD}
          onEnterPress={submitForm}
        />
        <ButtonComponent
          ariaLabel="submit-button"
          label={'popup_html_submit'}
          onClick={submitForm}
          fixToBottom
        />
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
  navigateToWithParams,
  addAccount,
  setTitleContainerProperties,
  setErrorMessage,
});
type PropsType = ConnectedProps<typeof connector>;

export const AddByKeysComponent = connector(AddByKeys);
