import React from 'react';

type Props = { text: string };

export const FieldsCaption = ({ text }: Props) => {
  return (
    <div
      className="dialog-caption"
      dangerouslySetInnerHTML={{
        __html: text,
      }}></div>
  );
};
