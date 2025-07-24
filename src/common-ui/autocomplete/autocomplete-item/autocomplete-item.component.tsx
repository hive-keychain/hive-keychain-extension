import React from 'react';
import { UsernameAvatar } from 'src/common-ui/username-with-avatar/username-with-avatar';

interface AutocompleteProps {
  value: string;
  translateValue?: boolean;
  subLabel?: string;
  translateSublabel?: boolean;
  onItemClick: (value: string) => void;
  prefix?: string;
}

const AutocompleteItemComponent = ({
  value,
  translateValue,
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
      {prefix === '@' && <UsernameAvatar username={value} />}
      {prefix + (translateValue ? chrome.i18n.getMessage(value) : value)}
      {subLabel && subLabel.trim().length > 0
        ? `(${translateSublabel ? chrome.i18n.getMessage(subLabel) : subLabel})`
        : ''}
    </div>
  );
};

export default AutocompleteItemComponent;
