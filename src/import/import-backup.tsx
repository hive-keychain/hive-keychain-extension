import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import React from 'react';
import ReactDOM from 'react-dom';
import ImportFile from 'src/import/import-file.component';

ReactDOM.render(
  <ImportFile
    title={'import_backup_html_title'}
    text={'import_backup_html_text'}
    command={BackgroundCommand.IMPORT_BACKUP}
    accept={'.kc'}
    callBackCommand={BackgroundCommand.SEND_BACK_IMPORTED_BACKUP}
  />,
  document.getElementById('root'),
);

export {};
