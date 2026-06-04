import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import React from 'react';
import ReactDOM from 'react-dom';
import { I18nProviderComponent } from 'src/common-ui/i18n/i18n-provider.component';
import ImportFile from './import-file.component';

ReactDOM.render(
  <I18nProviderComponent>
    <ImportFile
      title={'import_html_title'}
      text={'import_html_text'}
      command={BackgroundCommand.IMPORT_ACCOUNTS}
      accept={'.kc'}
      callBackCommand={BackgroundCommand.SEND_BACK_IMPORTED_ACCOUNTS}
    />
  </I18nProviderComponent>,
  document.getElementById('root'),
);

export {};
