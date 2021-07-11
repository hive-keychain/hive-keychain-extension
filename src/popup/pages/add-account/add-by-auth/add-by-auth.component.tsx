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
import { Keys } from 'src/interfaces/keys.interface';
import { LocalAccount } from 'src/interfaces/local-account.interface';
import { Screen } from 'src/reference-data/screen.enum';
import HiveUtils from 'src/utils/hive.utils';
import './add-by-auth.component.css';

interface AddByKeyProps {
  backEnabled: boolean;
  backPage: Screen;
  backSecondaryPage?: Screen;
}

const AddByAuth = ({
  setErrorMessage,
  navigateTo,
  localAccounts,
  addAccount,
  backEnabled,
  backPage,
  backSecondaryPage,
}: PropsType) => {
  const [username, setUsername] = useState('');
  const [authorizedAccount, setAuthorizedAccount] = useState('');

  const submitForm = async (): Promise<void> => {
    let localAuthorizedAccount: LocalAccount;

    if (username === '' || authorizedAccount === '') {
      setErrorMessage('popup_accounts_fill');
      return;
    }

    if (
      !localAccounts
        .map((localAccount: LocalAccount) => localAccount.name)
        .includes(authorizedAccount)
    ) {
      setErrorMessage('popup_no_auth_account', [authorizedAccount]);
      return;
    } else {
      localAuthorizedAccount = localAccounts.find(
        (localAccount: LocalAccount) => localAccount.name,
      );
    }

    if (
      localAccounts
        .map((localAccount: LocalAccount) => localAccount.name)
        .includes(username)
    ) {
      setErrorMessage('popup_accounts_already_registered');
      return;
    }

    const hiveAccounts = await HiveUtils.getClient().database.getAccounts([
      username,
    ]);

    if (!hiveAccounts || hiveAccounts.length === 0) {
      setErrorMessage('popup_accounts_incorrect_user');
      return;
    }
    let hiveAccount = hiveAccounts[0];

    const activeKeyInfo = hiveAccount.active;
    const postingKeyInfo = hiveAccount.posting;

    let keys: Keys = {};

    const activeAuth = activeKeyInfo.account_auths.find(
      (accountAuth) => accountAuth[0] === authorizedAccount,
    );
    const postingAuth = postingKeyInfo.account_auths.find(
      (accountAuth) => accountAuth[0] === authorizedAccount,
    );

    if (!activeAuth && !postingAuth) {
      setErrorMessage('popup_accounts_no_auth', [authorizedAccount, username]);
      return;
    }

    if (activeAuth && activeAuth[1] >= activeKeyInfo.weight_threshold) {
      keys.active = localAuthorizedAccount.keys.active;
      keys.activePubkey = `@${authorizedAccount}`;
    }
    if (postingAuth && postingAuth[1] >= postingKeyInfo.weight_threshold) {
      keys.posting = localAuthorizedAccount.keys.posting;
      keys.postingPubkey = `@${authorizedAccount}`;
    }

    addAccount({ name: username, keys: keys });
    navigateTo(Screen.SETTINGS_ROUTER, Screen.SETTINGS_MAIN_PAGE);
  };

  return (
    <div className="add-by-auth-page">
      <PageTitleComponent
        title="popup_html_setup"
        isBackButtonEnabled={backEnabled}
        backScreen={backPage}
        backSecondaryScreen={backSecondaryPage}
      />
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
type PropsType = ConnectedProps<typeof connector> & AddByKeyProps;

export const AddByAuthComponent = connector(AddByAuth);
