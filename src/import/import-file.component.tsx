import { BackgroundMessage } from '@background/background-message.interface';
import { Theme } from '@popup/theme.context';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useRef, useState } from 'react';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { NewIcons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { BackgroundCommand } from 'src/reference-data/background-message-key.enum';
import FileUtils from 'src/utils/file.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
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
  const [theme, setTheme] = useState<Theme>();
  const [selectedFile, setSelectedFile] = useState<File>();
  const [feedback, setFeedBack] = useState<any>();

  const inputEl = useRef<HTMLInputElement>(null);

  useEffect(() => {
    init();
  }, []);

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
      if (backgroundMessage.value.feedback) {
        setFeedBack(backgroundMessage.value.feedback);
      } else {
        setTimeout(() => {
          window.close();
        }, 3000);
      }

      chrome.runtime.onMessage.removeListener(
        onCallBackCommandeMessageListener,
      );
    }
  };

  const handleOpenFileInput = () => {
    inputEl.current?.click();
  };

  const init = async () => {
    const res = await LocalStorageUtils.getMultipleValueFromLocalStorage([
      LocalStorageKeyEnum.ACTIVE_THEME,
    ]);

    setTheme(res.ACTIVE_THEME ?? Theme.LIGHT);
  };

  return (
    <div className={`theme ${theme} import-file`}>
      <div className="title-panel">
        <SVGIcon icon={NewIcons.KEYCHAIN_LOGO_ROUND_SMALL} />
        <div className="title">{chrome.i18n.getMessage(title)}</div>
      </div>
      <div
        className="caption"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage(text),
        }}></div>
      <div className="upload-panel">
        <ButtonComponent
          type={ButtonType.IMPORTANT}
          label="Choose a file"
          onClick={handleOpenFileInput}
          skipLabelTranslation={true}
          height="small"></ButtonComponent>

        {selectedFile && selectedFile.name && (
          <InputComponent
            type={InputType.TEXT}
            onChange={() => null}
            value={selectedFile?.name}
            disabled
          />
        )}
        <input
          ref={inputEl}
          type="file"
          accept={accept}
          id="file"
          className="file-input"
          onChange={handleFileUpload}
        />
      </div>

      {selectedFile && (
        <ButtonComponent
          onClick={importKeysFromFile}
          label="popup_html_import"
          type={ButtonType.IMPORTANT}
          height="small"></ButtonComponent>
      )}

      {feedback && (
        <div
          className="feedback"
          dangerouslySetInnerHTML={{
            __html: chrome.i18n.getMessage(feedback.message, feedback.params),
          }}></div>
      )}
    </div>
  );
};

export default ImportFile;
