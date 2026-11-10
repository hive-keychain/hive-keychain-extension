import React from 'react';

import { I18nUtils } from 'src/utils/i18n.utils';
type Props = {
  title: string;
  content: string;
};

export const DisplayText = ({ title, content }: Props) => {
  return (
    <div className="display-text">
      <div className="display-text-title">{I18nUtils.getMessage(title)}</div>
      <div className="text">{content}</div>
    </div>
  );
};
