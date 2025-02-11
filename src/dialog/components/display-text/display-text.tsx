import React from 'react';
import sanitizeHtml from 'sanitize-html';

type Props = {
  title: string;
  content: string;
};

export const DisplayText = ({ title, content }: Props) => {
  console.log(
    content,
    sanitizeHtml(content, {
      allowedTags: ['p', 'br'],
      allowedAttributes: {},
      parser: {
        lowerCaseAttributeNames: false,
      },
    }),
  );
  return (
    <div className="display-text">
      <div className="display-text-title">{chrome.i18n.getMessage(title)}</div>
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
