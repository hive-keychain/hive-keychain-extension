import React from 'react';
import { I18nUtils } from 'src/utils/i18n.utils';

type Props = {
  messageKey: string;
};

export const CopyToastContent = ({ messageKey }: Props) => {
  return (
    <div
      className="copy-toast-content copy-toast-content--success"
      role="status"
      data-testid="copy-toast-content">
      <div className="copy-toast-message">
        {I18nUtils.getMessage(messageKey)}
      </div>
    </div>
  );
};
