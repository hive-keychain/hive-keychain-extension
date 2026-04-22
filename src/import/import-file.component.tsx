import { BackgroundMessage } from '@background/background-message.interface';
import { ImportCallbackPayload } from '@interfaces/import-callback.interface';
import { Theme } from '@popup/theme.context';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useRef, useState } from 'react';
import ButtonComponent, { ButtonType } from 'src/common-ui/button/button.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { ResultMessagePageComponent } from 'src/common-ui/result-message-page/result-message-page.component';
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
  const [result, setResult] = useState<ImportCallbackPayload>();

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
    setResult(undefined);
    setSelectedFile(event.target.files[0]);
  };

  const importKeysFromFile = async () => {
    if (selectedFile) {
      const base64 = await FileUtils.toBase64(selectedFile);
      const fileData = atob(base64);
      if (callBackCommand) {
        chrome.runtime.onMessage.addListener(onCallBackCommandeMessageListener);
      }
      chrome.runtime.sendMessage({
        command: command,
        value: fileData,
      });
      if (!callBackCommand) {
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
      setResult(parseImportResult(backgroundMessage.value));
      chrome.runtime.onMessage.removeListener(
        onCallBackCommandeMessageListener,
      );
    }
  };

  const parseImportResult = (value: any): ImportCallbackPayload => {
    if (value?.message && typeof value.success === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      return {
        success: value === 'html_popup_import_settings_successful',
        message: value,
      };
    }

    if (value?.accounts) {
      return {
        success: true,
        message: 'import_html_success',
        warning: value.warning ?? value.feedback,
        accounts: value.accounts,
      };
    }

    return {
      success: false,
      message: value?.warning?.message ?? value?.feedback?.message ?? 'import_html_error',
    };
  };

  const handleOpenFileInput = () => {
    inputEl.current?.click();
  };

  return (
    <div className={`theme ${theme} import-file`}>
      {result ? (
        <ResultMessagePageComponent
          type={result.success ? 'success' : 'error'}
          title={title}
          message={result.message}
          warningMessage={result.warning?.message}
          warningParams={result.warning?.params}
          autoCloseDelayMs={
            result.success &&
            result.warning?.message !== 'ledger_import_account_has_ledger'
              ? 5000
              : undefined
          }
          onClose={() => window.close()}
        />
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

export default ImportFile;
