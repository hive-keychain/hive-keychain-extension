import { BackgroundMessage } from '@background/background-message.interface';
import { Theme } from '@popup/theme.context';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useRef, useState } from 'react';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
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
  const [selectedFile, setSelectedFile] = useState<File>();
  const [feedback, setFeedBack] = useState<any>();

  const inputEl = useRef<HTMLInputElement>(null);

  const [theme, setTheme] = useState<Theme>();
  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const res = await LocalStorageUtils.getMultipleValueFromLocalStorage([
      LocalStorageKeyEnum.ACTIVE_THEME,
    ]);

    setTheme(res.ACTIVE_THEME ?? Theme.LIGHT);
  };

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

  return (
    <div className={`theme ${theme} import-file`}>
      <div className="title-panel">
        <SVGIcon icon={SVGIcons.KEYCHAIN_LOGO_ROUND_SMALL} />
        <div className="title">{chrome.i18n.getMessage(title)}</div>
      </div>
      <div
        className="caption"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage(text),
        }}></div>
      <div className="upload-panel">
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
        {feedback && (
          <div
            className="feedback"
            dangerouslySetInnerHTML={{
              __html: chrome.i18n.getMessage(feedback.message, feedback.params),
            }}></div>
        )}
      </div>

      <div className="button-panel">
        <ButtonComponent
          type={!selectedFile ? ButtonType.IMPORTANT : ButtonType.ALTERNATIVE}
          label={
            !selectedFile
              ? 'dialog_import_file_chose_file'
              : 'dialog_import_file_chose_another_file'
          }
          onClick={handleOpenFileInput}
          height="small"></ButtonComponent>

        {selectedFile && (
          <ButtonComponent
            onClick={importKeysFromFile}
            label="popup_html_import"
            type={ButtonType.IMPORTANT}
            height="small"></ButtonComponent>
        )}
      </div>
    </div>
  );
};

export default ImportFile;
