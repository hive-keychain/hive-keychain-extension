import {
  AutoCompleteValue,
  AutoCompleteValues,
} from '@interfaces/autocomplete.interface';

const filterStringList = (list: string[], query: string) => {
  return list.filter((item) => item.toLowerCase().includes(query));
};

const filterCategoriesList = (list: AutoCompleteValues, query: string) => {
  return list.categories.map((category) => {
    return {
      ...category,
      values: category.values.filter(
        (autocompleteValue) =>
          autocompleteValue.value.toLowerCase().includes(query) ||
          autocompleteValue.subLabel?.toLowerCase().includes(query),
      ),
    };
  });
};

const filterValuesList = (list: AutoCompleteValue[], query: string) => {
  return list.filter(
    (item) =>
      item.value.toLowerCase().includes(query) ||
      item.subLabel?.toLowerCase().includes(query),
  );
};

export const AutoCompleteUtils = {
  filterValuesList,
  filterCategoriesList,
  filterStringList,
};
