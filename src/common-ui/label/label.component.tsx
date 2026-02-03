import React from 'react';

interface Props {
  value: any;
  params?: any[];
  skipTranslation?: boolean;
  className?: string;
  onClick?: () => void;
}

export const LabelComponent = ({
  value,
  params,
  skipTranslation,
  className,
  onClick,
}: Props) => {
  const handleOnClick = () => {
    if (onClick) {
      onClick();
    }
  };
  return (
    <span className={className} onClick={handleOnClick}>
      {skipTranslation ? value : chrome.i18n.getMessage(value, params ?? [])}
    </span>
  );
};
