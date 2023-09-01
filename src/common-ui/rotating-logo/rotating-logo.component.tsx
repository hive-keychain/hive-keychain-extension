import React from 'react';
import { NewIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

const RotatingLogoComponent = () => (
  <SVGIcon
    className="rotating-logo"
    icon={NewIcons.KEYCHAIN_LOGO_ROUND}
    data-testid="loading-logo"
  />
);

export default RotatingLogoComponent;
