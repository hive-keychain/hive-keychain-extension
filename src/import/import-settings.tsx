import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import React from 'react';
import ReactDOM from 'react-dom';
import { I18nProviderComponent } from 'src/common-ui/i18n/i18n-provider.component';
import ImportFile from './import-file.component';

ReactDOM.render(
  <I18nProviderComponent>
    <ImportFile
      title={'import_permissions_html_title'}
      text={'import_permissions_html_text'}
      command={BackgroundCommand.SEND_BACK_SETTINGS}
      accept={'.json , .kc'}
      callBackCommand={BackgroundCommand.IMPORT_SETTINGS_CALLBACK}
    />
  </I18nProviderComponent>,
  document.getElementById('root'),
);

export {};
