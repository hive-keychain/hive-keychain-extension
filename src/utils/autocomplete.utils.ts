import {
  AutoCompleteValue,
  AutoCompleteValues,
} from '@interfaces/autocomplete.interface';

const filterStringList = (list: string[], query: string) => {
  return list.filter(
    (item) => typeof item === 'string' && item.toLowerCase().includes(query),
  );
};

const filterCategoriesList = (list: AutoCompleteValues, query: string) => {
  const filteredList = list.categories
    .map((category) => ({
      ...category,
      values: category.values.filter((autocompleteValue) => {
        const value = autocompleteValue?.value;
        if (typeof value !== 'string') {
          return false;
        }
        const subLabel = autocompleteValue?.subLabel;
        return (
          value.toLowerCase().includes(query) ||
          (typeof subLabel === 'string' &&
            subLabel.toLowerCase().includes(query))
        );
      }),
    }))
    .filter((category) => category.values.length > 0);
  return filteredList;
};

const filterValuesList = (list: AutoCompleteValue[], query: string) => {
  return list.filter((item) => {
    const value = item?.value;
    if (typeof value !== 'string') {
      return false;
    }
    const subLabel = item?.subLabel;
    return (
      value.toLowerCase().includes(query) ||
      (typeof subLabel === 'string' && subLabel.toLowerCase().includes(query))
    );
  });
};

export const AutoCompleteUtils = {
  filterValuesList,
  filterCategoriesList,
  filterStringList,
};
