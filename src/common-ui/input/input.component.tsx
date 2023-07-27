import { AutoCompleteValuesType } from '@interfaces/autocomplete.interface';
import React, { useEffect, useState } from 'react';
import AutocompleteBox from 'src/common-ui/autocomplete/autocomplete-box.component';
import { Icons, NewIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { InputType } from './input-type.enum';
import './input.component.scss';

interface InputProps {
  value: any;
  logo?: Icons | string | NewIcons;
  label?: string;
  placeholder: string;
  type: InputType;
  step?: number;
  min?: number;
  max?: number;
  skipLabelTranslation?: boolean;
  skipPlaceholderTranslation?: boolean;
  hint?: string;
  skipHintTranslation?: boolean;
  autocompleteValues?: AutoCompleteValuesType;
  translateSimpleAutoCompleteValues?: boolean;
  required?: boolean;
  hasError?: boolean;
  dataTestId?: string;
  disabled?: boolean;
  classname?: string;
  onChange: (value: any) => void;
  onEnterPress?(): any;
  onSetToMaxClicked?(): any;
}

const InputComponent = (props: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordDisplay, setPasswordDisplayed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return function cleanup() {
      setMounted(false);
    };
  });

  const handleOnBlur = () => {
    if (mounted) {
      setTimeout(() => setIsFocused(false), 200);
    }
  };
  const handleOnFocus = () => {
    setIsFocused(true);
  };

  return (
    <div className={`custom-input ${props.classname ?? ''}`}>
      {props.label && (
        <div className="label">
          {props.skipLabelTranslation
            ? props.label
            : chrome.i18n.getMessage(props.label)}{' '}
          {props.required ? '*' : ''}
        </div>
      )}
      <div
        className={`input-container ${props.logo ? '' : 'no-logo'} ${
          props.type === InputType.PASSWORD ? 'password-type' : ''
        } ${isFocused ? 'focused' : ''} `}>
        <input
          data-testid={props.dataTestId}
          className={`${props.hasError ? 'has-error' : ''} ${
            props.onSetToMaxClicked ? 'has-max-button' : ''
          }`}
          type={
            props.type === InputType.PASSWORD && isPasswordDisplay
              ? InputType.TEXT
              : props.type
          }
          placeholder={`${
            props.skipPlaceholderTranslation
              ? props.placeholder
              : chrome.i18n.getMessage(props.placeholder)
          } ${props.required ? '*' : ''}`}
          value={props.value}
          step={props.step}
          min={props.min}
          max={props.max}
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
          <SVGIcon
            icon={NewIcons.VISIBLE}
            className="input-img display-password"
            onClick={() => setPasswordDisplayed(true)}
          />
        )}
        {props.type === InputType.PASSWORD && isPasswordDisplay && (
          <SVGIcon
            icon={NewIcons.HIDE}
            className="input-img display-password"
            onClick={() => setPasswordDisplayed(false)}
          />
        )}
        {props.type !== InputType.PASSWORD &&
          !props.onSetToMaxClicked &&
          props.value &&
          props.value.length > 0 && (
            <SVGIcon
              dataTestId="input-clear"
              icon={NewIcons.CLEAR_ALL}
              className="input-img erase"
              onClick={() => props.onChange('')}
            />
          )}
        {isFocused && props.autocompleteValues && (
          <AutocompleteBox
            autoCompleteValues={props.autocompleteValues}
            handleOnChange={props.onChange}
            propsValue={props.value}
          />
        )}
        {props.hint && (
          <div className="hint">
            {props.skipHintTranslation
              ? props.hint
              : chrome.i18n.getMessage(props.hint)}
          </div>
        )}
        {props.logo && (
          <SVGIcon icon={props.logo as NewIcons} className="input-img" />
        )}
        {props.onSetToMaxClicked && (
          <SVGIcon
            data-testid="set-to-max-button"
            icon={NewIcons.MAX}
            onClick={props.onSetToMaxClicked}
          />
        )}
      </div>
    </div>
  );
};

export default InputComponent;
