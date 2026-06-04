import React from 'react';
import sanitizeHtml from 'sanitize-html';

import { I18nUtils } from 'src/utils/i18n.utils';
type Props = {
  title: string;
  content: string;
};

export const DisplayText = ({ title, content }: Props) => {
  return (
    <div className="display-text">
      <div className="display-text-title">{I18nUtils.getMessage(title)}</div>
      <div
        className="text"
        dangerouslySetInnerHTML={{
          __html: sanitizeHtml(content, {
            allowedTags: ['p', 'br', 'b'],
            allowedAttributes: {},
            parser: {
              lowerCaseAttributeNames: false,
            },
          }),
        }}></div>
    </div>
  );
};
