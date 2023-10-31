import React, { BaseSyntheticEvent, useState } from 'react';
import { OptionItem } from 'src/common-ui/custom-select/custom-select.component';
import { NewIcons } from 'src/common-ui/icons.enum';
import { Separator } from 'src/common-ui/separator/separator.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

interface CustomSelectItemProps<T> {
  isLast: boolean;
  item: T;
  isSelected: boolean;
  handleItemClicked: () => void;
  closeDropdown: () => void;
  rightActionIcon?: NewIcons;
  rightAction?: (...params: any) => void;
}

export function CustomSelectItemComponent<T extends OptionItem>({
  item,
  isSelected,
  isLast,
  handleItemClicked,
  closeDropdown,
  rightAction,
  rightActionIcon,
}: CustomSelectItemProps<T>) {
  const [hovered, setHovered] = useState<boolean>(false);

  const handleRightActionClick = (event: BaseSyntheticEvent) => {
    event.stopPropagation();
    event.preventDefault();
    if (rightAction) rightAction();
  };

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
        {rightAction && rightActionIcon && (
          <SVGIcon
            icon={rightActionIcon}
            onClick={(event) => handleRightActionClick(event)}
          />
        )}
        {isSelected && (
          <SVGIcon
            icon={NewIcons.ACTIVE}
            className="active-icon"
            forceHover={hovered}
            hoverable
          />
        )}
      </div>
      {!isLast && <Separator type={'horizontal'} />}
    </div>
  );
}
