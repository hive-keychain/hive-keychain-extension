import React from 'react';

import { I18nUtils } from 'src/utils/i18n.utils';
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
      {skipTranslation ? value : I18nUtils.getMessage(value, params ?? [])}
    </span>
  );
};
