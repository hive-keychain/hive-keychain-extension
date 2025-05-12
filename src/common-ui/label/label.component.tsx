import React from 'react';

interface Props {
  value: any;
  params?: any[];
  skipTranslation?: boolean;
  className?: string;
}

export const LabelComponent = ({
  value,
  params,
  skipTranslation,
  className,
}: Props) => {
  return (
    <span className={className}>
      {skipTranslation ? value : chrome.i18n.getMessage(value, params ?? [])}
    </span>
  );
};
