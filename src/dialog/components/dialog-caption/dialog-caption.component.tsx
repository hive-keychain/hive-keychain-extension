import React from 'react';
import { HtmlUtils } from 'src/utils/html.utils';

type Props = { text: string };

export const DialogCaption = ({ text }: Props) => {
  return (
    <div
      className="dialog-caption"
      dangerouslySetInnerHTML={{
        __html: HtmlUtils.sanitizeHtml(text),
      }}></div>
  );
};
