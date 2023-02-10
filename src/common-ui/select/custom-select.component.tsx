import React, { useEffect, useState } from 'react';
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
  value: any;
  skipLabelTranslation?: boolean;
  onSelectedValueChange: (value: any) => void;
}

const CustomSelect = ({
  options,
  skipLabelTranslation,
  value,
  onSelectedValueChange,
}: CustomSelectProps) => {
  const [selectedValue, setSelectedValue] = useState<SelectOption>(value);

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

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
        {selectProps.state.values[0].img && (
          <img src={selectProps.state.values[0].img} className="image" />
        )}
        <div className="label">
          {skipLabelTranslation
            ? selectProps.state.values[0].label
            : chrome.i18n.getMessage(selectProps.state.values[0].label)}
        </div>
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
          updateSelectedValue(selectProps.item);
          selectProps.methods.dropDown('close');
        }}>
        {selectProps.item.img && (
          <img src={selectProps.item.img} className="image" />
        )}
        <div className="label">
          {skipLabelTranslation
            ? selectProps.item.label
            : chrome.i18n.getMessage(selectProps.item.label)}
        </div>
      </div>
    );
  };

  return (
    <Select
      values={[selectedValue]}
      options={options}
      onChange={() => undefined}
      contentRenderer={contentRenderer}
      itemRenderer={itemRenderer}
      className="select-dropdown"
    />
  );
};

export default CustomSelect;
