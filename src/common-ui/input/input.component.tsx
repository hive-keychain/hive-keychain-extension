import { Icons } from '@popup/icons.enum';
import React, { useEffect, useState } from 'react';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import {
  FavoriteUserList,
  FavoriteUserListName,
} from 'src/utils/favorite-user.utils';
import { InputType } from './input-type.enum';
import './input.component.scss';

export interface AutoCompleteValue {
  value: string;
  subLabel?: string;
}

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
  autocompleteValues?: FavoriteUserList[];
  required?: boolean;
  hasError?: boolean;
  ariaLabel?: string;
  disabled?: boolean;
  onEnterPress?(): any;
  onSetToMaxClicked?(): any;
}

const InputComponent = (props: InputProps) => {
  const [filteredValues, setFilteredValues] = useState<FavoriteUserList[]>(
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
    if (props.autocompleteValues && props.autocompleteValues.length > 0) {
      const filteredFavoritesCompleteList: FavoriteUserList[] = [];
      if (
        props.autocompleteValues.find(
          (autoCompleteCategory) =>
            autoCompleteCategory.name === FavoriteUserListName.USERS,
        )
      ) {
        const filteredUserList = props.autocompleteValues
          .filter(
            (autoCompleteCategory) =>
              autoCompleteCategory.name === FavoriteUserListName.USERS,
          )[0]
          .list.filter(
            (listItem) =>
              listItem.account.toLowerCase().includes(props.value) ||
              listItem.label.toLowerCase().includes(props.value),
          );
        if (filteredUserList.length > 0) {
          filteredFavoritesCompleteList.push({
            name: FavoriteUserListName.USERS,
            list: filteredUserList,
          });
        }
      }
      if (
        props.autocompleteValues.find(
          (autoCompleteCategory) =>
            autoCompleteCategory.name === FavoriteUserListName.LOCAL_ACCOUNTS,
        )
      ) {
        const filteredLocalAccountsList = props.autocompleteValues
          .filter(
            (autoCompleteCategory) =>
              autoCompleteCategory.name === FavoriteUserListName.LOCAL_ACCOUNTS,
          )[0]
          .list.filter(
            (listItem) =>
              listItem.account.toLowerCase().includes(props.value) ||
              listItem.label.toLowerCase().includes(props.value),
          );
        if (filteredLocalAccountsList.length > 0) {
          filteredFavoritesCompleteList.push({
            name: FavoriteUserListName.LOCAL_ACCOUNTS,
            list: filteredLocalAccountsList,
          });
        }
      }
      if (
        props.autocompleteValues.find(
          (autoCompleteCategory) =>
            autoCompleteCategory.name === FavoriteUserListName.EXCHANGES,
        )
      ) {
        const filteredExchangesList = props.autocompleteValues
          .filter(
            (autoCompleteCategory) =>
              autoCompleteCategory.name === FavoriteUserListName.EXCHANGES,
          )[0]
          .list.filter(
            (listItem) =>
              listItem.account.toLowerCase().includes(props.value) ||
              listItem.label.toLowerCase().includes(props.value) ||
              listItem.subLabel?.toLowerCase().includes(props.value),
          );
        if (filteredExchangesList.length > 0) {
          filteredFavoritesCompleteList.push({
            name: FavoriteUserListName.EXCHANGES,
            list: filteredExchangesList,
          });
        }
      }
      setFilteredValues(filteredFavoritesCompleteList);
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
        {isFocused && filteredValues && filteredValues.length > 0 && (
          <div className="autocomplete-panel">
            {filteredValues.map((autoCompleteValue, index) => (
              <div className="title-category" key={`auto-complete-${index}`}>
                {autoCompleteValue.name.split('_').join(' ')}
                {autoCompleteValue.list.map((autoCompleteItem) => (
                  <div
                    className="value"
                    key={`auto-complete-${index}-${autoCompleteItem.account}`}
                    onClick={() => props.onChange(autoCompleteItem.account)}>
                    {autoCompleteItem.account}{' '}
                    {autoCompleteItem.label &&
                    autoCompleteItem.label.trim().length > 0
                      ? `(${autoCompleteItem.label})`
                      : autoCompleteItem.subLabel &&
                        autoCompleteItem.subLabel.trim().length > 0
                      ? `(${autoCompleteItem.subLabel})`
                      : ''}
                  </div>
                ))}
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
