import React from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

import { I18nUtils } from 'src/utils/i18n.utils';
const ServiceUnavailablePage = () => (
  <div className="service-unavailable-page">
    <SVGIcon icon={SVGIcons.MESSAGE_ERROR} />
    <div className="text">
      {I18nUtils.getMessage('service_unavailable_message')}
    </div>
  </div>
);

export default ServiceUnavailablePage;
