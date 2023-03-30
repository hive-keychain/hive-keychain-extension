import { AutoCompleteValuesType } from '@interfaces/autocomplete.interface';
import { Icons } from '@popup/icons.enum';
import React, { useEffect, useState } from 'react';
import AutocompleteBox from 'src/common-ui/autocomplete/autocomplete-box';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import { InputType } from './input-type.enum';
import './input.component.scss';

interface InputProps {
  value: any;
  logo?: Icons | string;
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
  required?: boolean;
  hasError?: boolean;
  ariaLabel?: string;
  disabled?: boolean;
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
    <div className="custom-input">
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
          aria-label={props.ariaLabel}
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
          <Icon
            onClick={() => setPasswordDisplayed(true)}
            name={Icons.VISIBLE}
            type={IconType.OUTLINED}
            additionalClassName="input-img display-password"></Icon>
        )}
        {props.type === InputType.PASSWORD && isPasswordDisplay && (
          <Icon
            onClick={() => setPasswordDisplayed(false)}
            name={Icons.HIDDEN}
            type={IconType.OUTLINED}
            additionalClassName="input-img display-password"></Icon>
        )}
        {props.type !== InputType.PASSWORD &&
          !props.onSetToMaxClicked &&
          props.value &&
          props.value.length > 0 && (
            <Icon
              ariaLabel="input-clear"
              onClick={() => props.onChange('')}
              name={Icons.CLEAR}
              type={IconType.OUTLINED}
              additionalClassName="input-img erase"></Icon>
          )}
        {isFocused && (
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
          <Icon
            name={props.logo}
            type={IconType.OUTLINED}
            additionalClassName="input-img"></Icon>
        )}
        {props.onSetToMaxClicked && (
          <span
            aria-label="set-to-max-button"
            className="set-to-max-button"
            onClick={props.onSetToMaxClicked}>
            {chrome.i18n.getMessage('popup_html_send_max')}
          </span>
        )}
      </div>
    </div>
  );
};

export default InputComponent;
