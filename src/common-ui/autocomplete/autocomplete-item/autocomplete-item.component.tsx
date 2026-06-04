import React from 'react';

import { I18nUtils } from 'src/utils/i18n.utils';
interface AutocompleteProps {
  value: string;
  label: string;
  translateLabel?: boolean;
  subLabel?: string;
  img?: string;
  translateSublabel?: boolean;
  onItemClick: (value: string) => void;
  prefix?: string;
}

export const AutocompleteItemComponent = ({
  label,
  translateLabel,
  value,
  subLabel,
  translateSublabel,
  img,
  onItemClick,
  prefix,
}: AutocompleteProps) => {
  return (
    <div
      className="autocomplete-item"
      key={value}
      onMouseDown={() => onItemClick(value)}>
      {img && <img src={img} className="user-avatar" />}
      <span>
        {prefix ?? ''}
        {translateLabel ? I18nUtils.getMessage(label) : label}{' '}
      </span>
      <div className="autocomplete-item-subvalue">
        {subLabel && subLabel.trim().length > 0
          ? `${translateSublabel ? I18nUtils.getMessage(subLabel) : subLabel}`
          : ''}
      </div>
    </div>
  );
};
