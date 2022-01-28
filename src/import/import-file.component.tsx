import { BackgroundMessage } from '@background/background-message.interface';
import React, { useRef, useState } from 'react';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { BackgroundCommand } from 'src/reference-data/background-message-key.enum';
import FileUtils from 'src/utils/file.utils';
import './import-file.scss';

interface PropsType {
  title: string;
  text: string;
  command: BackgroundCommand;
  accept: string;
  callBackCommand?: BackgroundCommand;
}

const ImportFile = ({
  title,
  text,
  command,
  accept,
  callBackCommand,
}: PropsType) => {
  const [selectedFile, setSelectedFile] = useState<File>();
  const [feedback, setFeedBack] = useState('');

  const inputEl = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: any) => {
    setSelectedFile(event.target.files[0]);
  };

  const importKeysFromFile = async () => {
    if (selectedFile) {
      const base64 = await FileUtils.toBase64(selectedFile);
      const fileData = atob(base64);
      chrome.runtime.sendMessage({
        command: command,
        value: fileData,
      });
      if (callBackCommand) {
        chrome.runtime.onMessage.addListener(onCallBackCommandeMessageListener);
      } else {
        window.close();
      }
    }
  };

  const onCallBackCommandeMessageListener = (
    backgroundMessage: BackgroundMessage,
    sender: chrome.runtime.MessageSender,
    sendResp: (response?: any) => void,
  ) => {
    if (backgroundMessage.command === callBackCommand) {
      setFeedBack(backgroundMessage.value);
      setTimeout(() => {
        window.close();
      }, 3000);
      chrome.runtime.onMessage.removeListener(
        onCallBackCommandeMessageListener,
      );
    }
  };

  const handleOpenFileInput = () => {
    inputEl.current?.click();
  };

  return (
    <div className="import-file">
      <div className="title-panel">
        <img src="/assets/images/iconhive.png" />
        <div className="title">{chrome.i18n.getMessage(title)}</div>
      </div>
      <div
        className="caption"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage(text),
        }}></div>
      <div className="upload-panel">
        <ButtonComponent
          label="Choose a file"
          onClick={handleOpenFileInput}
          skipLabelTranslation={true}></ButtonComponent>

        <input
          ref={inputEl}
          type="file"
          accept={accept}
          id="file"
          onChange={handleFileUpload}
        />
        <span id="file_span">{selectedFile?.name}</span>
      </div>

      {selectedFile && (
        <ButtonComponent
          onClick={importKeysFromFile}
          label="popup_html_import"
          type={ButtonType.RAISED}
          fixToBottom></ButtonComponent>
      )}

      <div className="feedback">{chrome.i18n.getMessage(feedback)}</div>
    </div>
  );
};

export default ImportFile;
