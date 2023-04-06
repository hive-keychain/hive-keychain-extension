export interface AutoCompleteValue {
  value: string;
  translateValue?: boolean;
  subLabel?: string;
  translateSubLabel?: boolean;
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
