export interface AutoCompleteValue {
  value: string;
  subLabel?: string;
}

export interface AutoCompleteCategory {
  title: string;
  skipTitleTranslation?: boolean;
  values: AutoCompleteValue[];
}

export interface AutoCompleteValues {
  categories: AutoCompleteCategory[];
}

export type AutoCompleteValuesType =
  | AutoCompleteValue[]
  | AutoCompleteValues
  | string[];

//   AutocompleteValueItem
//   take two props value sublabel
// for string[] => value = string[i] sublabel nothing
// for AutoCompleteValue[] => value = value // sublabel = sublabel
