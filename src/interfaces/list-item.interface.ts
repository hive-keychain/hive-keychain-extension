import { CurrencyLabels } from 'src/utils/currency.utils';

export interface CurrencyListItem {
  label: string;
  value: keyof CurrencyLabels;
}

export interface SavingOperationTypeListItem {
  label: string;
  value: string;
}
