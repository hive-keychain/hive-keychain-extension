import { setAccounts } from '@popup/actions/account.actions';
import { refreshActiveAccount } from '@popup/actions/active-account.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/actions/message.actions';
import { goBack } from '@popup/actions/navigation.actions';
import { RootState } from '@popup/store';
import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import { KeyType } from 'src/interfaces/keys.interface';
import { LocalAccount } from 'src/interfaces/local-account.interface';
import AccountUtils from 'src/utils/account.utils';
import './add-key.component.scss';

const AddKey = ({
  navParams,
  activeAccount,
  accounts,
  setAccounts,
  refreshActiveAccount,
  goBack,
  setErrorMessage,
  setSuccessMessage,
}: PropsType) => {
  const [privateKey, setPrivateKey] = useState('');

  const importKey = async () => {
    const keys = await AccountUtils.getKeys(activeAccount.name!, privateKey);
    let account = accounts.find(
      (account) => account.name === activeAccount.name,
    );
    if (keys && account) {
      switch (navParams) {
        case KeyType.ACTIVE:
          if (!keys.active) {
            setErrorMessage('popup_html_wrong_key', [
              chrome.i18n.getMessage('active'),
            ]);
            return;
          }
          account.keys.active = keys.active;
          account.keys.activePubkey = keys.activePubkey;
          break;
        case KeyType.POSTING:
          if (!keys.posting) {
            setErrorMessage('popup_html_wrong_key', [
              chrome.i18n.getMessage('posting'),
            ]);
            return;
          }
          account.keys.posting = keys.posting;
          account.keys.postingPubkey = keys.postingPubkey;
          break;
        case KeyType.MEMO:
          if (!keys.memo) {
            setErrorMessage('popup_html_wrong_key', [
              chrome.i18n.getMessage('memo'),
            ]);
            return;
          }
          account.keys.memo = keys.memo;
          account.keys.memoPubkey = keys.memoPubkey;
          break;
      }
      setSuccessMessage('import_html_success');
      setAccounts(accounts);
      refreshActiveAccount();
      goBack();
    }
  };

  return (
    <div className="add-key-page">
      <PageTitleComponent
        title="popup_html_add_key"
        isBackButtonEnabled={true}
      />
      <p
        className="introduction"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('popup_html_add_key_text'),
        }}></p>

      <InputComponent
        type={InputType.PASSWORD}
        logo="key"
        placeholder="popup_html_private_key"
        value={privateKey}
        onChange={setPrivateKey}
        onEnterPress={importKey}
      />
      <ButtonComponent label="popup_html_import_key" onClick={importKey} />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    navParams: state.navigation.params as KeyType,
    accounts: state.accounts as LocalAccount[],
  };
};

const connector = connect(mapStateToProps, {
  setAccounts,
  refreshActiveAccount,
  goBack,
  setErrorMessage,
  setSuccessMessage,
});
type PropsType = ConnectedProps<typeof connector>;

export const AddKeyComponent = connector(AddKey);
