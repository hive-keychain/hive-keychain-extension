import React from 'react';
import ReactDOM from 'react-dom';
import { I18nProviderComponent } from 'src/common-ui/i18n/i18n-provider.component';
import App from './App';
import './dialog.scss';

ReactDOM.render(
  <I18nProviderComponent>
    <App />
  </I18nProviderComponent>,
  document.getElementById('root'),
);
