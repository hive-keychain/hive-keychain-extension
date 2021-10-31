import React, { useEffect, useState } from 'react';
import { InputType } from './input-type.enum';
import './input.component.scss';

interface InputProps {
  onChange: (value: any) => void;
  value: any;
  logo?: string;
  placeholder: string;
  type: InputType;
  step?: number;
  min?: number;
  skipTranslation?: boolean;
  hint?: string;
  skipHintTranslation?: boolean;
  autocompleteValues?: any[];
  onEnterPress?(): any;
}

const InputComponent = (props: InputProps) => {
  const [filteredValues, setFilteredValues] = useState<any[]>(
    props.autocompleteValues ? props.autocompleteValues : [],
  );

  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordDisplay, setPasswordDisplayed] = useState(false);

  useEffect(() => {
    if (props.autocompleteValues) {
      setFilteredValues(
        props.autocompleteValues.filter((val) =>
          val.toLowerCase().includes(props.value),
        ),
      );
    }
  }, [props.value, props.autocompleteValues]);

  const handleOnBlur = () => {
    setTimeout(() => setIsFocused(false), 200);
  };
  const handleOnFocus = () => {
    setIsFocused(true);
  };

  return (
    <div className={`input-container ${props.logo ? '' : 'no-logo'}`}>
      <input
        type={
          props.type === InputType.PASSWORD && isPasswordDisplay
            ? InputType.TEXT
            : props.type
        }
        placeholder={
          props.skipTranslation
            ? props.placeholder
            : chrome.i18n.getMessage(props.placeholder)
        }
        value={props.value}
        step={props.step}
        min={props.min}
        onChange={(e) => props.onChange(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && props.onEnterPress) {
            props.onEnterPress();
          }
        }}
        onFocus={() => handleOnFocus()}
        onBlur={() => handleOnBlur()}
      />
      {props.type === InputType.PASSWORD && !isPasswordDisplay && (
        <img
          src={`/assets/images/eye.png`}
          className="input-img display-password"
          onClick={() => setPasswordDisplayed(true)}
        />
      )}
      {props.type === InputType.PASSWORD && isPasswordDisplay && (
        <img
          src={`/assets/images/hide.png`}
          className="input-img display-password"
          onClick={() => setPasswordDisplayed(false)}
        />
      )}
      {props.type !== InputType.PASSWORD && props.value.length > 0 && (
        <img
          src={`/assets/images/delete.png`}
          className="input-img erase"
          onClick={() => props.onChange('')}
        />
      )}
      {isFocused && filteredValues && filteredValues.length > 0 && (
        <div className="autocomplete-panel">
          {filteredValues.map((val, index) => (
            <div
              key={index}
              className="value"
              onClick={() => props.onChange(val)}>
              {val}
            </div>
          ))}
        </div>
      )}
      {props.hint && (
        <div className="hint">
          {props.skipHintTranslation
            ? props.hint
            : chrome.i18n.getMessage(props.hint)}
        </div>
      )}
      {props.logo && (
        <img src={`/assets/images/${props.logo}.png`} className="input-img" />
      )}
    </div>
  );
};

export default InputComponent;
