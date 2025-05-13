import React, { useEffect, useRef, useState } from 'react';
import Select, { SelectRenderer } from 'react-dropdown-select';
import { CustomSelectItemComponent } from 'src/common-ui/custom-select/custom-select-item.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

export enum OptionItemBadgeType {
  BADGE_RED = 'badge-red',
}
export interface OptionItemBagde {
  type: OptionItemBadgeType;
  label: string;
}

export interface OptionItem<T = any> {
  label: string;
  value: T;
  canDelete?: boolean;
  subLabel?: string;
  img?: string;
  imgBackup?: string;
  bagde?: OptionItemBagde;
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
  rightActionIcon?: boolean;
  rightActionClicked?: () => void;
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
    return itemProps.options.filter(
      (option) =>
        option.label.toLowerCase().includes(query.toLowerCase()) ||
        option.subLabel?.toLowerCase().includes(query.toLowerCase()),
    );
  };

  const customLabelRender = (selectProps: SelectRenderer<T>) => {
    return (
      <div
        className="selected-item"
        onClick={() => {
          selectProps.methods.dropDown('close');
        }}>
        {itemProps.selectedItem.img && (
          <img className="left-image" src={itemProps.selectedItem.img} />
        )}
        <span>{itemProps.selectedItem.label}</span>
        {itemProps.selectedItem.bagde && (
          <div className={`${itemProps.selectedItem.bagde.type}`}>
            {itemProps.selectedItem.bagde.label}
          </div>
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
        {itemProps.filterable && (
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
        {filteredOptions.map((option, index) => (
          <CustomSelectItemComponent
            key={`option-${option.label}-${index}`}
            isLast={props.options.length === index}
            item={option}
            isSelected={option.value === itemProps.selectedItem.value}
            handleItemClicked={() => itemProps.setSelectedItem(option)}
            closeDropdown={() => methods.dropDown('close')}
            onDelete={itemProps.onDelete}
            canDelete={option.canDelete}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="custom-select-container">
      {itemProps.label && (
        <div className="label">
          {itemProps.skipLabelTranslation
            ? itemProps.label
            : chrome.i18n.getMessage(itemProps.label)}
        </div>
      )}
      <Select
        values={[itemProps.selectedItem]}
        options={itemProps.options}
        onChange={() => undefined}
        dropdownHandleRenderer={customHandleRenderer}
        contentRenderer={customLabelRender}
        dropdownRenderer={customDropdownRenderer}
        className={`custom-select ${
          itemProps.background ? itemProps.background : ''
        }`}
      />
    </div>
  );
}
