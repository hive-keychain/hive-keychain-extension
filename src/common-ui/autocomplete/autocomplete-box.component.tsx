import {
  AutoCompleteValue,
  AutoCompleteValues,
  AutoCompleteValuesType,
} from '@interfaces/autocomplete.interface';
import React, { useEffect, useState } from 'react';
import AutocompleteItemComponent from 'src/common-ui/autocomplete/autocomplete-item/autocomplete-item.component';
import { AutoCompleteUtils } from 'src/utils/autocomplete.utils';
import './autocomplete-box.component.scss';

type Props = {
  autoCompleteValues?: AutoCompleteValuesType;
  translateSimpleAutoCompleteValues?: boolean;
  handleOnChange: (value: any) => void;
  propsValue: any;
};
const AutocompleteBox = ({
  autoCompleteValues,
  translateSimpleAutoCompleteValues,
  handleOnChange,
  propsValue,
}: Props) => {
  const [filteredValues, setFilteredValues] = useState<AutoCompleteValuesType>(
    autoCompleteValues ? autoCompleteValues : [],
  );

  useEffect(() => {
    if (autoCompleteValues) {
      const lowerCaseSearchValue = String(propsValue).toLowerCase();
      if (!!(autoCompleteValues as AutoCompleteValues).categories) {
        setFilteredValues({
          categories: AutoCompleteUtils.filterCategoriesList(
            autoCompleteValues as AutoCompleteValues,
            lowerCaseSearchValue,
          ),
        });
      } else if (typeof (autoCompleteValues as string[]).at(0) === 'string') {
        setFilteredValues(
          AutoCompleteUtils.filterStringList(
            autoCompleteValues as string[],
            lowerCaseSearchValue,
          ),
        );
      } else {
        setFilteredValues(
          AutoCompleteUtils.filterValuesList(
            autoCompleteValues as AutoCompleteValue[],
            lowerCaseSearchValue,
          ),
        );
      }
    }
  }, [propsValue, autoCompleteValues]);

  const renderList = (values: AutoCompleteValuesType) => {
    if (!!(autoCompleteValues as AutoCompleteValues).categories) {
      return (filteredValues as AutoCompleteValues).categories.map(
        (category) =>
          category.values.length > 0 && (
            <div className="category" key={category.title}>
              <span className="title">
                {category.translateTitle
                  ? chrome.i18n.getMessage(category.title)
                  : category.title}
              </span>
              {category.values.map((autoCompleteItem, index) => (
                <AutocompleteItemComponent
                  key={`item-${index}`}
                  value={autoCompleteItem.value}
                  translateValue={autoCompleteItem.translateValue}
                  onItemClick={handleOnChange}
                  subLabel={autoCompleteItem.subLabel}
                  translateSublabel={autoCompleteItem.translateSubLabel}
                />
              ))}
            </div>
          ),
      );
    } else if (typeof (autoCompleteValues as string[]).at(0) === 'string') {
      return (filteredValues as string[]).map((item, index) => (
        <AutocompleteItemComponent
          key={`item-${index}`}
          value={item}
          translateValue={translateSimpleAutoCompleteValues}
          onItemClick={handleOnChange}
        />
      ));
    } else {
      return (filteredValues as AutoCompleteValue[]).map((item, index) => (
        <AutocompleteItemComponent
          key={`item-${index}`}
          value={item.value}
          translateValue={item.translateValue}
          subLabel={item.subLabel}
          translateSublabel={item.translateSubLabel}
          onItemClick={handleOnChange}
        />
      ));
    }
  };

  return <div className="autocomplete-panel">{renderList(filteredValues)}</div>;
};

export default AutocompleteBox;
