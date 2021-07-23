import React, { Component } from 'react';
import { BackgroundCommand } from 'src/reference-data/background-message-key.enum';
import FileUtils from 'src/utils/file.utils';
import './import-keys.scss';

interface ImportAccountState {
  selectedFile?: File;
}

class App extends Component {
  state: ImportAccountState = {};

  handleFileUpload = (event: any) => {
    this.state.selectedFile = event.target.files[0];
  };

  importKeysFromFile = async () => {
    if (this.state.selectedFile) {
      const base64 = await FileUtils.toBase64(this.state.selectedFile);
      const fileData = atob(base64);
      chrome.runtime.sendMessage({
        command: BackgroundCommand.IMPORT_ACCOUNTS,
        value: fileData,
      });
    }
  };

  render() {
    return (
      <div className="import-keys">
        <div className="title-panel">
          <img src="/assets/images/iconhive.png" />
          <div className="title">
            {chrome.i18n.getMessage('import_html_title')}
          </div>
        </div>
        <div
          className="caption"
          dangerouslySetInnerHTML={{
            __html: chrome.i18n.getMessage('import_html_text'),
          }}></div>

        <input
          type="file"
          accept=".kc"
          id="file"
          onChange={this.handleFileUpload}
        />
        <label htmlFor="file">Choose a file</label>
        <span id="file_span">{this.state.selectedFile?.name}</span>
        <button id="proceed" onClick={this.importKeysFromFile}>
          {chrome.i18n.getMessage('popup_html_import')}
        </button>
      </div>
    );
  }
}

export default App;
