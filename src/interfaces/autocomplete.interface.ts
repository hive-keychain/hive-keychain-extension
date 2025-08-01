export interface AutoCompleteValue {
  label: string;
  translateLabel?: boolean;
  subLabel?: string;
  translateSubLabel?: boolean;
  value: string;
}

export interface AutoCompleteCategory {
  title: string;
  translateTitle?: boolean;
  values: AutoCompleteValue[];
}

export interface AutoCompleteValues {
  categories: AutoCompleteCategory[];
}

export type AutoCompleteValuesType =
  | AutoCompleteValue[]
  | AutoCompleteValues
  | string[];
