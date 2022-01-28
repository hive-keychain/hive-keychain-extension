import { addAccount } from '@popup/actions/account.actions';
import { navigateToWithParams } from '@popup/actions/navigation.actions';
import { Icons } from '@popup/icons.enum';
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
import './add-by-keys.component.scss';

const AddByKeys = ({
  navigateToWithParams,
  localAccounts,
  addAccount,
}: PropsType) => {
  const [username, setUsername] = useState('');
  const [privateKey, setPrivateKey] = useState('');

  const submitForm = async (): Promise<void> => {
    const keys = await AccountUtils.verifyAccount(
      username,
      privateKey,
      localAccounts,
    );
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
    <div className="add-by-keys-page">
      <PageTitleComponent
        title="popup_html_setup"
        isBackButtonEnabled={true}
        isCloseButtonDisabled={localAccounts.length === 0}
      />
      <div
        className="caption"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('popup_html_setup_text'),
        }}></div>
      <div className="form-container">
        <InputComponent
          value={username}
          onChange={setUsername}
          logo={Icons.AT}
          placeholder="popup_html_username"
          type={InputType.TEXT}
          onEnterPress={submitForm}
        />
        <InputComponent
          value={privateKey}
          onChange={setPrivateKey}
          logo={Icons.KEY}
          placeholder="popup_html_private_key"
          type={InputType.PASSWORD}
          onEnterPress={submitForm}
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
  navigateToWithParams,
  addAccount,
});
type PropsType = ConnectedProps<typeof connector>;

export const AddByKeysComponent = connector(AddByKeys);
