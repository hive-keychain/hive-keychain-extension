import { Icons } from '@popup/icons.enum';
import React from 'react';
import Icon from 'src/common-ui/icon/icon.component';
import './service-unavailable-page.component.scss';

const ServiceUnavailablePage = () => (
  <div className="service-unavailable-page">
    <Icon name={Icons.SERVER_UNAVAILABLE} />
    <div className="message">
      {chrome.i18n.getMessage('service_unavailable_message')}
    </div>
  </div>
);

export default ServiceUnavailablePage;
