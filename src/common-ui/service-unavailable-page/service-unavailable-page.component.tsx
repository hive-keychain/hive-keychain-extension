import React from 'react';
import Icon from 'src/common-ui/icon/icon.component';
import { Icons } from 'src/common-ui/icons.enum';
import './service-unavailable-page.component.scss';

const ServiceUnavailablePage = () => (
  <div className="service-unavailable-page">
    <Icon name={Icons.CLOSE} />
    <div className="message">
      {chrome.i18n.getMessage('service_unavailable_message')}
    </div>
  </div>
);

export default ServiceUnavailablePage;
