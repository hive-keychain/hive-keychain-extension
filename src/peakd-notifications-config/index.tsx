import React from 'react';
import ReactDOM from 'react-dom';
import { I18nProviderComponent } from 'src/common-ui/i18n/i18n-provider.component';
import { NotificationsAdvancedConfig } from 'src/peakd-notifications-config/notifications-advanced-config.component';
import './notifications-advanced-config.component.scss';
ReactDOM.render(
  <I18nProviderComponent>
    <NotificationsAdvancedConfig />
  </I18nProviderComponent>,
  document.getElementById('root'),
);

export {};
