import { Icons } from '@popup/icons.enum';
import React, { useEffect, useState } from 'react';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import { InputType } from './input-type.enum';
import './input.component.scss';

interface InputProps {
  onChange: (value: any) => void;
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
  autocompleteValues?: any[];
  onEnterPress?(): any;
  onSetToMaxClicked?(): any;
  required?: boolean;
  hasError?: boolean;
  ariaLabel?: string;
}

const InputComponent = (props: InputProps) => {
  const [filteredValues, setFilteredValues] = useState<any[]>(
    props.autocompleteValues ? props.autocompleteValues : [],
  );

  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordDisplay, setPasswordDisplayed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return function cleanup() {
      setMounted(false);
    };
  });

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
          aria-label={props.ariaLabel} //modified for testings
          className={`${props.hasError ? 'has-error' : ''}`}
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
          props.value.length > 0 && (
            <Icon
              onClick={() => props.onChange('')}
              name={Icons.CLEAR}
              type={IconType.OUTLINED}
              additionalClassName="input-img erase"></Icon>
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
          <Icon
            name={props.logo}
            type={IconType.OUTLINED}
            additionalClassName="input-img"></Icon>
        )}
        {props.onSetToMaxClicked && (
          <span className="set-to-max-button" onClick={props.onSetToMaxClicked}>
            {chrome.i18n.getMessage('popup_html_send_max')}
          </span>
        )}
      </div>
    </div>
  );
};

export default InputComponent;
