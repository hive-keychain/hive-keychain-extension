import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { CurrencyLabels } from 'src/popup/hive/utils/currency.utils';

export interface CurrencyListItem {
  label: string;
  value: keyof CurrencyLabels;
}

export interface SavingOperationTypeListItem {
  label: string;
  value: string;
}

export interface EvmLocalAccountListItem {
  label: string;
  value: EvmAccount;
}

export interface LocalAccountListItem {
  label: string;
  value: string;
}
