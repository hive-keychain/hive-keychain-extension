import React from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

type Props = {
  messageKey: string;
};

export const CopyToastContent = ({ messageKey }: Props) => {
  return (
    <div
      className="copy-toast-content copy-toast-content--success"
      data-testid="copy-toast-content">
      <div className="copy-toast-icon-badge">
        <SVGIcon
          className="copy-toast-icon"
          dataTestId="copy-toast-success-icon"
          icon={SVGIcons.GLOBAL_CHECK}
        />
      </div>
      <div className="copy-toast-message">
        {chrome.i18n.getMessage(messageKey)}
      </div>
    </div>
  );
};
