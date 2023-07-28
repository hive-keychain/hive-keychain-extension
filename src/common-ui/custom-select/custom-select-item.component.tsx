import React, { useState } from 'react';
import { OptionItem } from 'src/common-ui/custom-select/custom-select.component';
import { NewIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

interface CustomSelectItemProps<T> {
  isLast: boolean;
  item: T;
  isSelected: boolean;
  handleItemClicked: () => void;
  closeDropdown: () => void;
}

export function CustomSelectItemComponent<T extends OptionItem>({
  item,
  isSelected,
  isLast,
  handleItemClicked,
  closeDropdown,
}: CustomSelectItemProps<T>) {
  const [hovered, setHovered] = useState<boolean>(false);

  return (
    <div
      className="option"
      onMouseEnter={() => {
        setHovered(true);
      }}
      onMouseLeave={() => setHovered(false)}>
      <div
        data-testid={`custom-select-item-${item.value}`}
        className={`custom-select-item ${isSelected ? 'selected' : ''}`}
        onClick={() => {
          handleItemClicked();
          closeDropdown();
        }}>
        <div className="item-label">{item.label}</div>
        {isSelected && (
          <SVGIcon
            icon={NewIcons.ACTIVE}
            className="active-icon"
            forceHover={hovered}
            hoverable
          />
        )}
      </div>
      {!isLast && <div className="separator"></div>}
    </div>
  );
}
