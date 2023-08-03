import React from 'react';
import Select, { SelectRenderer } from 'react-dropdown-select';
import { CustomSelectItemComponent } from 'src/common-ui/custom-select/custom-select-item.component';
import { NewIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import './custom-select.component.scss';

export interface OptionItem {
  label: string;
  value: string;
}

export interface CustomSelectProps<T> {
  options: T[];
  selectedItem: T;
  setSelectedItem: (item: T) => void;
}

export function CustomSelect<T extends OptionItem>(
  itemProps: CustomSelectProps<T>,
) {
  const customLabelRender = (selectProps: SelectRenderer<T>) => {
    return (
      <div
        className="selected-item"
        onClick={() => {
          selectProps.methods.dropDown('close');
        }}>
        {itemProps.selectedItem.label}
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
          state.dropdown ? NewIcons.SELECT_ARROW_UP : NewIcons.SELECT_ARROW_DOWN
        }
      />
    );
  };

  const customDropdownRenderer = ({
    props,
    state,
    methods,
  }: SelectRenderer<T>) => {
    return (
      <div className="custom-select-dropdown">
        {props.options.map((option, index) => (
          <CustomSelectItemComponent
            key={`option-${option.value}`}
            isLast={props.options.length === index}
            item={option}
            isSelected={option.value === itemProps.selectedItem.value}
            handleItemClicked={() => itemProps.setSelectedItem(option)}
            closeDropdown={() => methods.dropDown('close')}
          />
        ))}
      </div>
    );
  };

  return (
    <Select
      values={[itemProps.selectedItem]}
      options={itemProps.options}
      onChange={() => undefined}
      dropdownHandleRenderer={customHandleRenderer}
      contentRenderer={customLabelRender}
      dropdownRenderer={customDropdownRenderer}
      className="custom-select"
    />
  );
}
