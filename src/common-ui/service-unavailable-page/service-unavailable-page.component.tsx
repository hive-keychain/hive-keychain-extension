import React from 'react';
import { NewIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

const ServiceUnavailablePage = () => (
  <div className="service-unavailable-page">
    <SVGIcon icon={NewIcons.MESSAGE_ERROR} />
    <div className="text">
      {chrome.i18n.getMessage('service_unavailable_message')}
    </div>
  </div>
);

export default ServiceUnavailablePage;
