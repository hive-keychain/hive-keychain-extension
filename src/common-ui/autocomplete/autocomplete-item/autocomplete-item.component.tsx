import React from 'react';

interface AutocompleteProps {
  value: string;
  translateValue?: boolean;
  subLabel?: string;
  translateSublabel?: boolean;
  onItemClick: (value: string) => void;
}

const AutocompleteItemComponent = ({
  value,
  translateValue,
  subLabel,
  translateSublabel,
  onItemClick,
}: AutocompleteProps) => {
  return (
    <div
      className="autocomplete-item"
      key={value}
      onClick={() => onItemClick(value)}>
      {translateValue ? chrome.i18n.getMessage(value) : value}{' '}
      {subLabel && subLabel.trim().length > 0
        ? `(${translateSublabel ? chrome.i18n.getMessage(subLabel) : subLabel})`
        : ''}
    </div>
  );
};

export default AutocompleteItemComponent;
