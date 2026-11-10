import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmAddressDetail } from '@popup/evm/utils/evm-addresses.utils';
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
  value: EvmSelectAccountItem;
}

export interface EvmSelectAccountItem {
  account: EvmAccount;
  addressDetails: EvmAddressDetail;
}

export interface LocalAccountListItem {
  label: string;
  value: string;
}
