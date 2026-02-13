import React from 'react';

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
        {translateLabel ? chrome.i18n.getMessage(label) : label}{' '}
      </span>
      <div className="autocomplete-item-subvalue">
        {subLabel && subLabel.trim().length > 0
          ? `${translateSublabel ? chrome.i18n.getMessage(subLabel) : subLabel}`
          : ''}
      </div>
    </div>
  );
};
