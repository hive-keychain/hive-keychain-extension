export interface AutoCompleteValue {
  value: string;
  subLabel?: string;
}

export interface AutoCompleteCategory {
  title: string;
  values: AutoCompleteValue[];
}

export interface AutoCompleteValues {
  categories: AutoCompleteCategory[];
}

export type AutoCompleteValuesType =
  | AutoCompleteValue[]
  | AutoCompleteValues
  | string[];
