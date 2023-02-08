import React, { useState } from 'react';
import Select, {
  SelectItemRenderer,
  SelectRenderer,
} from 'react-dropdown-select';
import 'react-tabs/style/react-tabs.scss';
import './custom-select.component.scss';

export interface SelectOption {
  label: string;
  subLabel?: string;
  value: any;
  img?: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  defaultValue: any;
  skipLabelTranslation?: boolean;
  onSelectedValueChange: (value: any) => void;
}

const CustomSelect = ({
  options,
  skipLabelTranslation,
  onSelectedValueChange,
}: CustomSelectProps) => {
  const [selectedValue, setSelectedValue] = useState();

  const updateSelectedValue = (newValue: any) => {
    setSelectedValue(newValue);
    onSelectedValueChange(newValue);
  };

  const contentRenderer = (selectProps: SelectRenderer<SelectOption>) => {
    return (
      <div
        className="selected-value"
        onClick={() => {
          selectProps.methods.dropDown('close');
        }}>
        {skipLabelTranslation
          ? selectedValue
          : chrome.i18n.getMessage(selectedValue!)}
      </div>
    );
  };
  const itemRenderer = (selectProps: SelectItemRenderer<SelectOption>) => {
    return (
      <div
        className={`select-item ${
          selectedValue === selectProps.item.value ? 'selected' : ''
        }`}
        onClick={() => {
          updateSelectedValue(selectProps.item.value);
          selectProps.methods.dropDown('close');
        }}>
        {selectProps.item.img && (
          <img src={selectProps.item.img} className="image" />
        )}
        <div className="label">{selectProps.item.label}</div>
      </div>
    );
  };

  return (
    <Select
      values={[]}
      options={options}
      onChange={() => undefined}
      contentRenderer={contentRenderer}
      itemRenderer={itemRenderer}
      className="select-dropdown"
    />
  );
};

export default CustomSelect;
