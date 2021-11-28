import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import React from 'react';
import ReactDOM from 'react-dom';
import ImportFile from './import-file.component';

ReactDOM.render(
  <ImportFile
    title={'import_permissions_html_title'}
    text={'import_permissions_html_text'}
    command={BackgroundCommand.SEND_BACK_SETTINGS}
    accept={'.json , .kc'}
  />,
  document.getElementById('root'),
);

export {};
