import {
  AutoCompleteValue,
  AutoCompleteValues,
} from '@interfaces/autocomplete.interface';

// make sure to compare both lowercase values (query and value in list)

const filterStringList = (list: string[], query: string) => {
  return [];
};

const filterCategoriesList = (list: AutoCompleteValues, query: string) => {
  return [];
};

const filterValuesList = (list: AutoCompleteValue[], query: string) => {
  return [];
};

export const AutoCompleteUtils = {
  filterValuesList,
  filterCategoriesList,
  filterStringList,
};
