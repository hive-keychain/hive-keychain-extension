import React from 'react';

interface AutocompleteProps {
  value: string;
  label: string;
  translateLabel?: boolean;
  subLabel?: string;
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
  onItemClick,
  prefix,
}: AutocompleteProps) => {
  return (
    <div
      className="autocomplete-item"
      key={value}
      onClick={() => onItemClick(value)}>
      {translateLabel ? chrome.i18n.getMessage(label) : label}{' '}
      <div className="autocomplete-item-subvalue">
        {subLabel && subLabel.trim().length > 0
          ? `${translateSublabel ? chrome.i18n.getMessage(subLabel) : subLabel}`
          : ''}
      </div>
      {/* {prefix === '@' && <UsernameAvatar username={value} />}
      {prefix + (translateValue ? chrome.i18n.getMessage(value) : value)}
      {subLabel && subLabel.trim().length > 0
        ? `(${translateSublabel ? chrome.i18n.getMessage(subLabel) : subLabel})`
        : ''} */}
    </div>
  );
};
