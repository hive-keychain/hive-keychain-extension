import { ChainLogo } from '@common-ui/chain-logo/chain-logo.component';
import { PreloadedImage } from '@common-ui/preloaded-image/preloaded-image.component';
import React, { BaseSyntheticEvent, useEffect, useState } from 'react';
import { OptionItem } from 'src/common-ui/custom-select/custom-select.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { Separator } from 'src/common-ui/separator/separator.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { ColorsUtils } from 'src/utils/colors.utils';
import { EnumUtils } from 'src/utils/enum.utils';

interface CustomSelectItemProps<T> {
  isLast: boolean;
  item: T;
  isSelected: boolean;
  handleItemClicked: () => void;
  closeDropdown: () => void;
  onDelete?: (...params: any) => void;
  canDelete?: boolean;
  generateImageIfNull?: boolean;
}

export function CustomSelectItemComponent<T extends OptionItem>({
  item,
  isSelected,
  isLast,
  handleItemClicked,
  closeDropdown,
  onDelete,
  canDelete = false,
  generateImageIfNull = false,
}: CustomSelectItemProps<T>) {
  const [color, setColor] = useState<string>();
  const itemTestId = item.key ?? String(item.value ?? item.label);

  const handleDeleteClick = (event: BaseSyntheticEvent) => {
    event.stopPropagation();
    event.preventDefault();
    if (onDelete) onDelete(item, event);
  };

  useEffect(() => {
    if (!item.img) {
      setColor(ColorsUtils.stringToColor(item.label));
    }
  }, [item]);

  return (
    <div className="option">
      <div
        data-testid={`custom-select-item-${itemTestId}`}
        className={`custom-select-item ${isSelected ? 'selected' : ''} ${item.imgChip ? 'has-img-chip' : ''}`}
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
            {item.img && !EnumUtils.isValueOf(item.img, SVGIcons) && (
              <img className="left-image" src={item.img} />
            )}
            {!item.img && generateImageIfNull && (
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
