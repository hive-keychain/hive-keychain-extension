import { SVGIcons } from '@common-ui/icons.enum';
import { SVGIcon } from '@common-ui/svg-icon/svg-icon.component';
import React from 'react';

import { I18nUtils } from 'src/utils/i18n.utils';
export const ComingSoonPanel = () => {
  return (
    <div className="coming-soon-panel">
      <SVGIcon icon={SVGIcons.MESSAGE_WARNING} />
      <div className="title">
        {I18nUtils.getMessage('coming_soon_panel_title')}
      </div>
      <div className="description">
        {I18nUtils.getMessage('coming_soon_panel_description')}
      </div>
    </div>
  );
};
