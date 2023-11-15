import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { KeyType } from 'src/interfaces/keys.interface';
import { addKey } from 'src/popup/hive/actions/account.actions';
import { setErrorMessage } from 'src/popup/hive/actions/message.actions';
import { goBack } from 'src/popup/hive/actions/navigation.actions';
import { setTitleContainerProperties } from 'src/popup/hive/actions/title-container.actions';
import { RootState } from 'src/popup/hive/store';
// import { LedgerUtils } from 'src/utils/ledger.utils';
import { Screen } from '@reference-data/screen.enum';

const AddKey = ({
  keyType,
  activeAccountName,
  goBack,
  addKey,
  setTitleContainerProperties,
  setErrorMessage,
  isLedgerSupported,
}: PropsType) => {
  const [privateKey, setPrivateKey] = useState('');

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_add_key',
      isBackButtonEnabled: true,
    });
  });

  const importKey = async () => {
    if (privateKey.trim().length === 0) {
      setErrorMessage('popup_accounts_fill');
      return;
    }
    addKey(privateKey.trim(), keyType, setErrorMessage);
    goBack();
  };

  const navigateToUseLedger = async () => {
    const extensionId = (await chrome.management.getSelf()).id;
    chrome.tabs.create({
      url: `chrome-extension://${extensionId}/add-key-from-ledger.html?keyType=${keyType}&username=${activeAccountName}`,
    });
  };

  return (
    <div
      className="add-key-page"
      data-testid={`${Screen.SETTINGS_ADD_KEY}-page`}>
      <div
        data-testid="add-key-page-paragraph-introduction"
        className="caption"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('popup_html_add_key_text', [
            keyType.substring(0, 1) + keyType.substring(1).toLowerCase(),
          ]),
        }}></div>

      <InputComponent
        dataTestId="input-private-key"
        type={InputType.PASSWORD}
        placeholder="popup_html_private_key"
        value={privateKey}
        onChange={setPrivateKey}
        onEnterPress={importKey}
      />

      {keyType === KeyType.ACTIVE && isLedgerSupported && (
        <div className="add-using-ledger" onClick={navigateToUseLedger}>
          {chrome.i18n.getMessage('popup_html_add_using_ledger')}
        </div>
      )}

      <div className="fill-space"></div>

      <ButtonComponent
        dataTestId="import-keys-button"
        label="popup_html_import_key"
        onClick={importKey}
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    keyType: state.navigation.stack[0].params as KeyType,
    activeAccountName: state.activeAccount.name,
    isLedgerSupported: state.appStatus.isLedgerSupported,
  };
};

const connector = connect(mapStateToProps, {
  goBack,
  addKey,
  setTitleContainerProperties,
  setErrorMessage,
});
type PropsType = ConnectedProps<typeof connector>;

export const AddKeyComponent = connector(AddKey);
