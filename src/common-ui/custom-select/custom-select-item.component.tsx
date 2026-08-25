import { ChainLogo } from '@common-ui/chain-logo/chain-logo.component';
import { PreloadedImage } from '@common-ui/preloaded-image/preloaded-image.component';
import React, { BaseSyntheticEvent, useEffect, useState } from 'react';
import { OptionItem } from 'src/common-ui/custom-select/custom-select.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { Separator } from 'src/common-ui/separator/separator.component';
import type { SortableDragHandleRef } from 'src/common-ui/sortable-list/sortable-list.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { ColorsUtils } from 'src/utils/colors.utils';
import { EnumUtils } from 'src/utils/enum.utils';

interface CustomSelectItemProps<T> {
  id: string;
  isLast: boolean;
  item: T;
  isSelected: boolean;
  isKeyboardActive: boolean;
  handleItemClicked: () => void;
  closeDropdown: () => void;
  onDelete?: (...params: any) => void;
  canDelete?: boolean;
  generateImageIfNull?: boolean;
  enableDragAndDrop?: boolean;
  dragHandleRef?: SortableDragHandleRef;
  isDragging?: boolean;
}

export function CustomSelectItemComponent<T extends OptionItem>({
  id,
  item,
  isSelected,
  isKeyboardActive,
  isLast,
  handleItemClicked,
  closeDropdown,
  onDelete,
  canDelete = false,
  generateImageIfNull = false,
  enableDragAndDrop = false,
  dragHandleRef,
  isDragging = false,
}: CustomSelectItemProps<T>) {
  const [color, setColor] = useState<string>();
  const [hovered, setHovered] = useState(false);
  const itemTestId = item.key ?? String(item.value ?? item.label);

  const handleDeleteClick = (event: BaseSyntheticEvent) => {
    event.stopPropagation();
    event.preventDefault();
    if (onDelete) onDelete(item, event);
  };

  useEffect(() => {
    if (!item.img && item.label) {
      setColor(ColorsUtils.stringToColor(item.label));
    }
  }, [item]);

  const renderTrailingActions = () => {
    if (enableDragAndDrop) {
      return (
        <div className="icons-wrapper">
          {isSelected && !hovered && !isDragging && (
            <SVGIcon icon={SVGIcons.SELECT_ACTIVE} className="active-icon" />
          )}
          {(hovered || isDragging) &&
            !process.env.IS_FIREFOX &&
            dragHandleRef && (
              <span ref={dragHandleRef}>
                <SVGIcon icon={SVGIcons.SELECT_DRAG} className="drag-icon" />
              </span>
            )}
        </div>
      );
    }

    return (
      <>
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
      </>
    );
  };

  return (
    <div
      className="option"
      onMouseEnter={() => {
        setHovered(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
      }}>
      <div
        id={id}
        data-testid={`custom-select-item-${itemTestId}`}
        className={`custom-select-item ${isSelected ? 'selected' : ''} ${isKeyboardActive ? 'keyboard-active' : ''} ${item.imgChip ? 'has-img-chip' : ''} ${enableDragAndDrop ? 'draggable' : ''}`}
        role="option"
        aria-selected={isSelected}
        onClick={() => {
          handleItemClicked();
          closeDropdown();
        }}>
        {((item.img ||
          (generateImageIfNull && !item.img)) ||
          item.imgChip) && (
          <>
            {item.img && EnumUtils.isValueOf(item.img, SVGIcons) && (
              <SVGIcon className="left-svg" icon={item.img as SVGIcons} />
            )}
            {item.img &&
              item.imgChainName &&
              !EnumUtils.isValueOf(item.img, SVGIcons) && (
                <ChainLogo
                  className="left-image"
                  logoUri={item.img}
                  chainName={item.imgChainName}
                />
              )}
            {item.img &&
              !item.imgChainName &&
              !EnumUtils.isValueOf(item.img, SVGIcons) && (
              <img className="left-image" src={item.img} />
            )}
            {!item.img && generateImageIfNull && item.label && (
              <div
                className="currency-icon add-background"
                style={{
                  backgroundColor: `${color}2b`,
                  color: `${color}`,
                }}>
                {item.label.slice(0, 2)}
              </div>
            )}
            {item.imgChip && (
              <>
                {EnumUtils.isValueOf(item.imgChip, SVGIcons) && (
                  <SVGIcon
                    className="left-svg-chip"
                    icon={item.imgChip as SVGIcons}
                  />
                )}
                {!EnumUtils.isValueOf(item.imgChip, SVGIcons) &&
                  item.imgChipChainName && (
                    <ChainLogo
                      className="left-svg-chip"
                      logoUri={item.imgChip as string}
                      chainName={item.imgChipChainName}
                    />
                  )}
                {!EnumUtils.isValueOf(item.imgChip, SVGIcons) &&
                  !item.imgChipChainName && (
                    <PreloadedImage
                      className="left-svg-chip"
                      src={item.imgChip as string}
                    />
                  )}
              </>
            )}
          </>
        )}
        <div className="item-label">
          {item.label}
          {item.subLabel && (
            <>
              <span className="item-sub-label">{item.subLabel}</span>
              <span className="item-sub-label-hover">{item.subLabelHover}</span>
            </>
          )}
        </div>
        {renderTrailingActions()}
      </div>
      {!isLast && <Separator type={'horizontal'} />}
    </div>
  );
}
