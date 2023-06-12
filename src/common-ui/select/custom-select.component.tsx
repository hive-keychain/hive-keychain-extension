import React, { useEffect, useRef, useState } from 'react';
import Select, { SelectRenderer } from 'react-dropdown-select';
import 'react-tabs/style/react-tabs.scss';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import './custom-select.component.scss';

export interface SelectOption {
  label: string;
  subLabel?: string;
  value: any;
  img?: string;
  imgBackup?: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  selectedValue: any;
  skipLabelTranslation?: boolean;
  filterable?: boolean;
  setSelectedValue: (value: any) => void;
}

const CustomSelect = ({
  options,
  skipLabelTranslation,
  selectedValue,
  filterable,
  setSelectedValue,
}: CustomSelectProps) => {
  const updateSelectedValue = (newValue: any) => {
    setSelectedValue(newValue);
  };
  const ref = useRef<HTMLInputElement>(null);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [query, setQuery] = useState('');

  useEffect(() => {
    setFilteredOptions(filter(query));
  }, [query]);

  const filter = (query: string) => {
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(query.toLowerCase()) ||
        option.subLabel?.toLowerCase().includes(query.toLowerCase()),
    );
  };

  const contentRenderer = (selectProps: SelectRenderer<SelectOption>) => {
    return (
      <div
        className="selected-value"
        onClick={() => {
          selectProps.methods.dropDown('close');
        }}>
        {selectedValue && selectedValue.img && (
          <img
            src={selectedValue.img}
            className="image"
            onError={({ currentTarget }) => {
              currentTarget.onerror = null;
              currentTarget.src = selectedValue.imgBackup!;
            }}
          />
        )}
        {selectedValue && (
          <div className="label">
            {skipLabelTranslation
              ? selectedValue.label
              : chrome.i18n.getMessage(selectedValue.label)}
          </div>
        )}
      </div>
    );
  };

  const dropdownRenderer = ({
    props,
    state,
    methods,
  }: SelectRenderer<SelectOption>) => {
    setTimeout(() => {
      ref.current?.focus();
    }, 200);
    return (
      <div className="custom-dropdown">
        {filterable && (
          <InputComponent
            onChange={setQuery}
            value={query}
            placeholder={''}
            type={InputType.TEXT}
            ref={ref}
          />
        )}
        {filteredOptions.map((option) => {
          return (
            <div
              className={`select-item ${
                selectedValue === option.value ? 'selected' : ''
              }`}
              onClick={() => {
                updateSelectedValue(option);
                methods.dropDown('close');
              }}
              key={`option-${option.label}`}>
              {option.img && (
                <img
                  src={option.img}
                  className="image"
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null;

                    currentTarget.src = option.imgBackup!;
                  }}
                />
              )}
              <div className="label">
                {skipLabelTranslation
                  ? option.label
                  : chrome.i18n.getMessage(option.label)}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Select
      values={[selectedValue]}
      options={filteredOptions}
      onChange={() => undefined}
      contentRenderer={contentRenderer}
      className="select-dropdown"
      dropdownRenderer={dropdownRenderer}
    />
  );
};

export default CustomSelect;
