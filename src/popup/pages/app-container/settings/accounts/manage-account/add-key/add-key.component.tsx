import { addKey } from '@popup/actions/account.actions';
import { setErrorMessage } from '@popup/actions/message.actions';
import { goBack } from '@popup/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { KeyType } from 'src/interfaces/keys.interface';
// import { LedgerUtils } from 'src/utils/ledger.utils';
import './add-key.component.scss';

const AddKey = ({
  navParams,
  goBack,
  addKey,
  setTitleContainerProperties,
  setErrorMessage,
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
    addKey(privateKey.trim(), navParams, setErrorMessage);
    goBack();
  };

  const navigateToUseLedger = async () => {
    const extensionId = (await chrome.management.getSelf()).id;
    chrome.tabs.create({
      url: `chrome-extension://${extensionId}/connect-ledger.html`,
    });
    // chrome.windows.getCurrent(async (currentWindow) => {
    //   const win: chrome.windows.CreateData = {
    //     url: chrome.runtime.getURL('connect-ledger.html'),
    //     type: 'popup',
    //     height: 566,
    //     width: 350,
    //     left: currentWindow.width! - 350 + currentWindow.left!,
    //     top: currentWindow.top,
    //   };
    //   // Except on Firefox
    //   //@ts-ignore
    //   if (typeof InstallTrigger === undefined) win.focused = true;
    //   const window = await chrome.windows.create(win);
    //   // setImportWindow(window.id);
    // });
  };

  return (
    <div className="add-key-page">
      <p
        aria-label="add-key-page-paragraph-introduction"
        className="introduction"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('popup_html_add_key_text', [
            navParams.substring(0, 1) + navParams.substring(1).toLowerCase(),
          ]),
        }}></p>

      <InputComponent
        ariaLabel="input-private-key"
        type={InputType.PASSWORD}
        logo={Icons.KEY}
        placeholder="popup_html_private_key"
        value={privateKey}
        onChange={setPrivateKey}
        onEnterPress={importKey}
      />

      {navParams === KeyType.ACTIVE && (
        <div className="add-using-ledger" onClick={navigateToUseLedger}>
          {chrome.i18n.getMessage('popup_html_add_using_ledger')}
        </div>
      )}

      <ButtonComponent
        ariaLabel="import-keys-button"
        label="popup_html_import_key"
        onClick={importKey}
        fixToBottom
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    navParams: state.navigation.stack[0].params as KeyType,
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
