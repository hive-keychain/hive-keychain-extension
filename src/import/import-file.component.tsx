import React, { useState } from 'react';
import { BackgroundCommand } from 'src/reference-data/background-message-key.enum';
import FileUtils from 'src/utils/file.utils';
import './import-file.scss';

interface PropsType {
  title: string;
  text: string;
  command: BackgroundCommand;
  accept: string;
}

const ImportFile = ({ title, text, command, accept }: PropsType) => {
  const [selectedFile, setSelectedFile] = useState<File>();

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
      window.close();
    }
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

      <input
        type="file"
        accept={accept}
        id="file"
        onChange={handleFileUpload}
      />
      <label htmlFor="file">Choose a file</label>
      <span id="file_span">{selectedFile?.name}</span>
      <button id="proceed" onClick={importKeysFromFile}>
        {chrome.i18n.getMessage('popup_html_import')}
      </button>
    </div>
  );
};

export default ImportFile;
