import { SVGIcons } from '@common-ui/icons.enum';
import { SVGIcon } from '@common-ui/svg-icon/svg-icon.component';
import React from 'react';

export const ComingSoonPanel = () => {
  return (
    <div className="coming-soon-panel">
      <SVGIcon icon={SVGIcons.MESSAGE_WARNING} />
      <div className="title">
        {chrome.i18n.getMessage('coming_soon_panel_title')}
      </div>
      <div className="description">
        {chrome.i18n.getMessage('coming_soon_panel_description')}
      </div>
    </div>
  );
};
