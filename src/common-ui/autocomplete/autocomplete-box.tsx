import {
  AutoCompleteValue,
  AutoCompleteValues,
  AutoCompleteValuesType,
} from '@interfaces/autocomplete.interface';
import React, { useEffect, useState } from 'react';
import { AutoCompleteUtils } from 'src/utils/autocomplete.utils';
import './autocomplete-box.scss';

type Props = {
  autoCompleteValues: AutoCompleteValuesType | undefined;
  handleOnChange: (value: any) => void;
  propsValue: any;
};
//TODO cedric needs to render the other 2 cases:
//  | AutoCompleteValue[]
//   | string[];
const AutocompleteBox = ({
  autoCompleteValues,
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
        if ((autoCompleteValues as AutoCompleteValues).categories.length === 0)
          return;
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

  return (
    <div className="autocomplete-panel">
      {!!(filteredValues as AutoCompleteValues).categories &&
        (filteredValues as AutoCompleteValues).categories.map(
          (autoCompleteValue, index) =>
            autoCompleteValue.values.length > 0 ? (
              <div className="title-category" key={`auto-complete-${index}`}>
                {autoCompleteValue.title.split('_').join(' ')}
                {autoCompleteValue.values.map((autoCompleteItem) => (
                  <div
                    className="value"
                    key={`auto-complete-${index}-${autoCompleteItem.value}`}
                    onClick={() => handleOnChange(autoCompleteItem.value)}>
                    {autoCompleteItem.value}{' '}
                    {autoCompleteItem.subLabel &&
                    autoCompleteItem.subLabel.trim().length > 0
                      ? `(${autoCompleteItem.subLabel})`
                      : ''}
                  </div>
                ))}
              </div>
            ) : null,
        )}
    </div>
  );
};

export default AutocompleteBox;
