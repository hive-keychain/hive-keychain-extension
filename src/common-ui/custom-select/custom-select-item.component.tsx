import React, { BaseSyntheticEvent } from 'react';
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
  onDelete?: (...params: any) => void;
  canDelete?: boolean;
}

export function CustomSelectItemComponent<T extends OptionItem>({
  item,
  isSelected,
  isLast,
  handleItemClicked,
  closeDropdown,
  onDelete,
  canDelete = false,
}: CustomSelectItemProps<T>) {
  const handleDeleteClick = (event: BaseSyntheticEvent) => {
    event.stopPropagation();
    event.preventDefault();
    if (onDelete) onDelete(item, event);
  };

  return (
    <div className="option">
      <div
        data-testid={`custom-select-item-${item.value}`}
        className={`custom-select-item ${isSelected ? 'selected' : ''}`}
        onClick={() => {
          handleItemClicked();
          closeDropdown();
        }}>
        {item.img && (
          <img
            className="left-image"
            src={item.img}
            onError={(e: any) => {
              e.target.onError = null;
              e.target.src =
                item.imgBackup ?? '/assets/images/wallet/hive-engine.svg';
            }}
          />
        )}
        <div className="item-label">{item.label}</div>
        {onDelete && canDelete && !isSelected && (
          <SVGIcon
            className="right-action-icon"
            icon={NewIcons.SELECT_DELETE}
            onClick={(event) => handleDeleteClick(event)}
          />
        )}
        {isSelected && (
          <SVGIcon icon={NewIcons.SELECT_ACTIVE} className="active-icon" />
        )}
      </div>
      {!isLast && <Separator type={'horizontal'} />}
    </div>
  );
}
