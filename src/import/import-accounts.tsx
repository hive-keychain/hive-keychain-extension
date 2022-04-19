import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import React from 'react';
import ReactDOM from 'react-dom';
import ImportFile from './import-file.component';

ReactDOM.render(
  <ImportFile
    title={'import_html_title'}
    text={'import_html_text'}
    command={BackgroundCommand.IMPORT_ACCOUNTS}
    accept={'.kc'}
    callBackCommand={BackgroundCommand.SEND_BACK_IMPORTED_ACCOUNTS}
  />,
  document.getElementById('root'),
);

export {};
