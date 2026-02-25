import FlatList from 'flatlist-react';
import React, { useEffect, useRef, useState } from 'react';
import Select, { SelectRenderer } from 'react-dropdown-select';
import { CustomSelectItemComponent } from 'src/common-ui/custom-select/custom-select-item.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { EnumUtils } from 'src/utils/enum.utils';

export interface OptionItem {
  label: string;
  value: any;
  canDelete?: boolean;
  subLabel?: string;
  subLabelHover?: string;
  img?: string;
  imgChip?: SVGIcons | string;
  imgBackup?: string;
  key?: string;
}

export interface CustomSelectProps<T> {
  label?: string;
  skipLabelTranslation?: boolean;
  options: T[];
  selectedItem: T;
  setSelectedItem: (item: T) => void;
  background?: 'white';
  onDelete?: (...params: any) => void;
  filterable?: boolean;
  additionalClassname?: string;
  footer?: JSX.Element;
  formatSelectedItem?: (...params: any) => string;
  renderOnlyIcon?: boolean;
  rightActionIcon?: boolean;
  rightActionClicked?: () => void;
  generateImageIfNull?: boolean;
  minFilterLength?: number;
  customFilter?: JSX.Element;
}

export function ComplexeCustomSelect<T extends OptionItem>(
  itemProps: CustomSelectProps<T>,
) {
  const ref = useRef<HTMLInputElement>(null);

  const [filteredOptions, setFilteredOptions] = useState(itemProps.options);
  const [query, setQuery] = useState('');

  useEffect(() => {
    setFilteredOptions(filter(query));
  }, [query, itemProps.options]);

  const filter = (query: string) => {
    if (itemProps.minFilterLength && query.length < itemProps.minFilterLength) {
      return [];
    }
    return itemProps.options.filter(
      (option) =>
        option.label.toLowerCase().includes(query.toLowerCase()) ||
        option.subLabel?.toLowerCase().includes(query.toLowerCase()),
    );
  };

  const customLabelRender = (selectProps: SelectRenderer<T>) => {
    return (
      <div
        className={`selected-item ${itemProps.selectedItem?.imgChip ? 'has-img-chip' : ''}`}
        onClick={() => {
          selectProps.methods.dropDown('close');
        }}>
        {itemProps.selectedItem.img && (
          <>
            {EnumUtils.isValueOf(itemProps.selectedItem.img, SVGIcons) && (
              <SVGIcon
                className="left-svg"
                icon={itemProps.selectedItem.img as SVGIcons}
              />
            )}
            {!EnumUtils.isValueOf(itemProps.selectedItem.img, SVGIcons) && (
              <PreloadedImage
                className="left-image"
                src={itemProps.selectedItem.img}
              />
            )}
            {itemProps.selectedItem.imgChip && (
              <>
                {EnumUtils.isValueOf(
                  itemProps.selectedItem.imgChip,
                  SVGIcons,
                ) && (
                  <SVGIcon
                    className="left-svg-chip"
                    icon={itemProps.selectedItem.imgChip as SVGIcons}
                  />
                )}
                {!EnumUtils.isValueOf(
                  itemProps.selectedItem.imgChip,
                  SVGIcons,
                ) && (
                  <PreloadedImage
                    className="left-svg-chip"
                    src={itemProps.selectedItem.imgChip as string}
                  />
                )}
              </>
            )}
          </>
        )}
        {!itemProps.renderOnlyIcon && (
          <span>
            {itemProps.formatSelectedItem
              ? itemProps.formatSelectedItem(itemProps.selectedItem.label)
              : itemProps.selectedItem.label}
          </span>
        )}
      </div>
    );
  };

  const customHandleRenderer = ({
    props,
    state,
    methods,
  }: SelectRenderer<T>) => {
    return (
      <SVGIcon
        className="custom-select-handle"
        icon={
          state.dropdown ? SVGIcons.SELECT_ARROW_UP : SVGIcons.SELECT_ARROW_DOWN
        }
      />
    );
  };

  const customDropdownRenderer = ({
    props,
    state,
    methods,
  }: SelectRenderer<T>) => {
    setTimeout(() => {
      ref.current?.focus();
    }, 200);
    return (
      <div className="custom-select-dropdown">
        {itemProps.filterable && !itemProps.customFilter && (
          <InputComponent
            onChange={setQuery}
            value={query}
            placeholder={''}
            type={InputType.TEXT}
            ref={ref}
            classname="filter-input"
            rightActionIcon={
              itemProps.rightActionIcon ? SVGIcons.WALLET_SEARCH : undefined
            }
            rightActionClicked={itemProps.rightActionClicked ?? undefined}
          />
        )}
        {itemProps.filterable &&
          !!itemProps.customFilter &&
          itemProps.customFilter}

        <FlatList
          list={filteredOptions}
          renderItem={(option: T, index: number) => (
            <CustomSelectItemComponent
              key={option.key ?? `option-${option.label}`}
              isLast={props.options.length === index}
              item={option}
              isSelected={option.value === itemProps.selectedItem.value}
              handleItemClicked={() => {
                itemProps.setSelectedItem(option);
              }}
              closeDropdown={() => methods.dropDown('close')}
              onDelete={itemProps.onDelete}
              canDelete={
                option.canDelete &&
                itemProps.selectedItem.value !== option.value
              }
              generateImageIfNull={itemProps.generateImageIfNull}
            />
          )}
          renderOnScroll
        />
        {itemProps.footer && itemProps.footer}
      </div>
    );
  };

  return (
    <div
      className={`custom-select-container ${
        itemProps.additionalClassname ?? ''
      }`}>
      {itemProps.label && (
        <div className="label">
          {itemProps.skipLabelTranslation
            ? itemProps.label
            : chrome.i18n.getMessage(itemProps.label)}
        </div>
      )}
      <Select
        options={itemProps.options}
        onChange={() => undefined}
        dropdownHandleRenderer={customHandleRenderer}
        contentRenderer={customLabelRender}
        dropdownRenderer={customDropdownRenderer}
        className={`custom-select ${
          itemProps.background ? itemProps.background : ''
        }`}
        values={[]}
      />
    </div>
  );
}
