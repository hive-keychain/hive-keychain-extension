import {
  AutoCompleteValue,
  AutoCompleteValues,
} from '@interfaces/autocomplete.interface';

const filterStringList = (list: string[], query: string) => {
  const filteredList = list.filter((item) =>
    item.toLowerCase().includes(query),
  );
  return filteredList;
};

const filterCategoriesList = (list: AutoCompleteValues, query: string) => {
  let filteredList = list.categories.map((category) => {
    return {
      ...category,
      values: category.values.filter(
        (autocompleteValue) =>
          autocompleteValue.value.toLowerCase().includes(query) ||
          autocompleteValue.subLabel?.toLowerCase().includes(query),
      ),
    };
  });
  filteredList = filteredList.filter((category) => category.values, length > 0);
  return filteredList;
};

const filterValuesList = (list: AutoCompleteValue[], query: string) => {
  const filteredList = list.filter(
    (item) =>
      item.value.toLowerCase().includes(query) ||
      item.subLabel?.toLowerCase().includes(query),
  );
  return filteredList;
};

export const AutoCompleteUtils = {
  filterValuesList,
  filterCategoriesList,
  filterStringList,
};
