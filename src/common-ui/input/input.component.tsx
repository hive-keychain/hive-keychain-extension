import {
  AutoCompleteValue,
  AutoCompleteValues,
  AutoCompleteValuesType,
} from '@interfaces/autocomplete.interface';
import { Icons } from '@popup/icons.enum';
import React, { useEffect, useState } from 'react';
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
  const [filteredValues, setFilteredValues] = useState<AutoCompleteValuesType>(
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
    //removed from bellow props.autocompleteValues.length > 0
    //TODO see what happens when passing empty arrays
    if (props.autocompleteValues) {
      const autoCompleteValues = props.autocompleteValues;
      //TODO create autocomplete utils file & move all bellow, just return
      //  filtered + typeObject so we can use it to render.
      let filtered: AutoCompleteValuesType;

      // TODO use if else instead of a switch

      switch (true) {
        //TODO change bellow
        // if (a !== undefined)
        // You can write If(!!a)
        case (autoCompleteValues as AutoCompleteValues).categories !==
          undefined:
          console.log('We have AutoCompleteValues');
          ///////
          //OLD code
          // const filteredFavoritesCompleteList: FavoriteUserList[] = [];
          // if (
          //   props.autocompleteValues.find(
          //     (autoCompleteCategory) =>
          //       autoCompleteCategory.name === FavoriteUserListName.USERS,
          //   )
          // ) {
          //   const filteredUserList = props.autocompleteValues
          //     .filter(
          //       (autoCompleteCategory) =>
          //         autoCompleteCategory.name === FavoriteUserListName.USERS,
          //     )[0]
          //     .list.filter(
          //       (listItem) =>
          //         listItem.account.toLowerCase().includes(props.value) ||
          //         listItem.label.toLowerCase().includes(props.value),
          //     );
          //   if (filteredUserList.length > 0) {
          //     filteredFavoritesCompleteList.push({
          //       name: FavoriteUserListName.USERS,
          //       list: filteredUserList,
          //     });
          //   }
          // }
          // if (
          //   props.autocompleteValues.find(
          //     (autoCompleteCategory) =>
          //       autoCompleteCategory.name === FavoriteUserListName.LOCAL_ACCOUNTS,
          //   )
          // ) {
          //   const filteredLocalAccountsList = props.autocompleteValues
          //     .filter(
          //       (autoCompleteCategory) =>
          //         autoCompleteCategory.name === FavoriteUserListName.LOCAL_ACCOUNTS,
          //     )[0]
          //     .list.filter(
          //       (listItem) =>
          //         listItem.account.toLowerCase().includes(props.value) ||
          //         listItem.label.toLowerCase().includes(props.value),
          //     );
          //   if (filteredLocalAccountsList.length > 0) {
          //     filteredFavoritesCompleteList.push({
          //       name: FavoriteUserListName.LOCAL_ACCOUNTS,
          //       list: filteredLocalAccountsList,
          //     });
          //   }
          // }
          // if (
          //   props.autocompleteValues.find(
          //     (autoCompleteCategory) =>
          //       autoCompleteCategory.name === FavoriteUserListName.EXCHANGES,
          //   )
          // ) {
          //   const filteredExchangesList = props.autocompleteValues
          //     .filter(
          //       (autoCompleteCategory) =>
          //         autoCompleteCategory.name === FavoriteUserListName.EXCHANGES,
          //     )[0]
          //     .list.filter(
          //       (listItem) =>
          //         listItem.account.toLowerCase().includes(props.value) ||
          //         listItem.label.toLowerCase().includes(props.value) ||
          //         listItem.subLabel?.toLowerCase().includes(props.value),
          //     );
          //   if (filteredExchangesList.length > 0) {
          //     filteredFavoritesCompleteList.push({
          //       name: FavoriteUserListName.EXCHANGES,
          //       list: filteredExchangesList,
          //     });
          //   }
          // }
          // setFilteredValues(filteredFavoritesCompleteList);
          //END Old code
          ///////
          const testFiltered = (
            autoCompleteValues as AutoCompleteValues
          ).categories.filter(
            (category) => category.title.toLowerCase().includes(props.value),
            // ||
            // category.values.filter(
            //   (categoryItem) =>
            //     categoryItem.value.toLowerCase().includes(props.value) ||
            //     categoryItem.subLabel?.toLowerCase().includes(props.value),
            // )
          );
          console.log({ testFiltered }); //TODO to remove

          // setFilteredValues(filtered);
          break;
        case Array.isArray(autoCompleteValues) &&
          typeof (autoCompleteValues as string[]).at(0) === 'string':
          console.log('Array of strings!!!');
          filtered = (autoCompleteValues as string[]).filter((item) =>
            item.toLowerCase().includes(props.value),
          );
          console.log({ filtered }); //TODO to remove
          setFilteredValues(filtered);
          break;
        case Array.isArray(autoCompleteValues) &&
          typeof (autoCompleteValues as AutoCompleteValue[]).at(0) === 'object':
          console.log('Array of objects!!!');
          filtered = (autoCompleteValues as AutoCompleteValue[]).filter(
            (item) =>
              item.value.toLowerCase().includes(props.value) ||
              item.subLabel?.toLowerCase().includes(props.value),
          );
          console.log({ filtered }); //TODO to remove
          setFilteredValues(filtered);
          break;
      }
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
        {/* //removed from bellow && filteredValues.length > 0 //TODO check */}
        {isFocused && filteredValues && (
          <div className="autocomplete-panel">
            {/* {filteredValues.map((autoCompleteValue, index) => (
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
            ))} */}
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
