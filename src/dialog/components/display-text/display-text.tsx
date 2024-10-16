import React from 'react';

type Props = {
  title: string;
  content: string;
};

export const DisplayText = ({ title, content }: Props) => {
  return (
    <div className="display-text">
      <div className="display-text-title">{chrome.i18n.getMessage(title)}</div>
      <div
        className="text"
        dangerouslySetInnerHTML={{
          __html: content,
        }}></div>
    </div>
  );
};
