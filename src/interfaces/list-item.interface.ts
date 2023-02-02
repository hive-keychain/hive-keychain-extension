import { CurrencyLabels } from 'src/utils/currency.utils';

export interface CurrencyListItem {
  label: string;
  value: keyof CurrencyLabels;
}

export interface SavingOperationTypeListItem {
  label: string;
  value: string;
}

export interface LocalAccountListItem {
  label: string;
  value: string;
}

export interface CurrentWithdrawingListItem {
  amount: string;
  complete: string;
  from: string;
  id: number;
  memo: string;
  request_id: number;
  to: string;
}
