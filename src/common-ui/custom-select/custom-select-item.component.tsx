import React, { BaseSyntheticEvent } from 'react';
import { OptionItem } from 'src/common-ui/custom-select/custom-select.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { Separator } from 'src/common-ui/separator/separator.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { EnumUtils } from 'src/utils/enum.utils';

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
        data-testid={`custom-select-item-${item.key}`}
        className={`custom-select-item ${isSelected ? 'selected' : ''}`}
        onClick={() => {
          handleItemClicked();
          closeDropdown();
        }}>
        {item.img && (
          <>
            {EnumUtils.isValueOf(item.img, SVGIcons) && (
              <SVGIcon className="left-svg" icon={item.img as SVGIcons} />
            )}
            {!EnumUtils.isValueOf(item.img, SVGIcons) && (
              <img className="left-image" src={item.img} />
            )}
          </>
        )}
        <div className="item-label">{item.label}</div>
        {onDelete && canDelete && !isSelected && (
          <SVGIcon
            className="right-action-icon"
            icon={SVGIcons.SELECT_DELETE}
            onClick={(event) => handleDeleteClick(event)}
          />
        )}
        {isSelected && (
          <SVGIcon icon={SVGIcons.SELECT_ACTIVE} className="active-icon" />
        )}
      </div>
      {!isLast && <Separator type={'horizontal'} />}
    </div>
  );
}
