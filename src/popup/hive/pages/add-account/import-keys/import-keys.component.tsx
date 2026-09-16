import { BackgroundMessage } from '@background/multichain/background-message.interface';
import { Screen } from '@interfaces/screen.interface';
import ImportAccountsFileUtils from '@popup/hive/utils/import-accounts-file.utils';
import { goBack } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useRef } from 'react';
import { connect, ConnectedProps, useStore } from 'react-redux';
import { BackgroundCommand } from 'src/reference-data/background-message-key.enum';
import { CommunicationUtils } from 'src/utils/communication.utils';
import FileUtils from 'src/utils/file.utils';

const ImportKeys = ({
  setTitleContainerProperties,
  goBack,
}: PropsFromRedux) => {
  const reduxStore = useStore<RootState>();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_import_keys',
      isBackButtonEnabled: true,
    });
  }, []);

  useEffect(() => {
    inputRef.current?.click();
  }, []);

  useEffect(() => {
    const onSentBackAccountsListener = (message: BackgroundMessage) => {
      if (message.command !== BackgroundCommand.SEND_BACK_IMPORTED_ACCOUNTS) {
        return;
      }

      void ImportAccountsFileUtils.applyImportedAccountsMessage(
        message,
        reduxStore,
      );
    };

    chrome.runtime.onMessage.addListener(onSentBackAccountsListener);
    return () => {
      chrome.runtime.onMessage.removeListener(onSentBackAccountsListener);
    };
  }, [reduxStore]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      goBack();
      return;
    }
    const base64 = await FileUtils.toBase64(selectedFile);
    const fileData = atob(base64);
    CommunicationUtils.runtimeSendMessage({
      command: BackgroundCommand.IMPORT_ACCOUNTS,
      value: fileData,
    });
  };

  return (
    <div
      className="import-keys-page"
      data-testid={`${Screen.ACCOUNT_PAGE_IMPORT_KEYS}-page`}>
      <input
        ref={inputRef}
        type="file"
        accept=".kc"
        style={{ display: 'none' }}
        onChange={(event) => void handleFileUpload(event)}
      />
    </div>
  );
};

const connector = connect(null, {
  setTitleContainerProperties,
  goBack,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ImportKeysComponent = connector(ImportKeys);
