import { KeychainKeyTypes } from '@interfaces/keychain.interface';
import {
  EvmTransactionInfo,
  EvmTransactionWarning,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { GasFeeEstimationBase } from '@popup/evm/interfaces/gas-fee.interface';

export type TransactionWarning = EvmTransactionWarning;
export type TransactionInfo = EvmTransactionInfo;

export interface ConfirmationPageParams {
  fields: ConfirmationPageFields[] | ConfirmationPageEvmFields[];
  message: string;
  warningMessage?: string;
  warningParams?: string[];
  skipWarningTranslation?: boolean;
  title: string;
  skipTitleTranslation?: boolean;
  afterConfirmAction: <T>(params?: T) => {};
  afterCancelAction?: () => {};
  formParams?: any;
}

export interface EVMConfirmationPageParams extends ConfirmationPageParams {
  hasGasFee?: boolean;
}

export interface HiveConfirmationPageParams extends ConfirmationPageParams {
  method: KeychainKeyTypes | null;
}

export interface ConfirmationPageFields {
  label: string;
  value: string | JSX.Element;
  labelParams?: string[];
  valueParams?: string[];
  valueClassName?: string;
  warnings?: TransactionWarning[];
  info?: TransactionInfo[];
}

export interface ConfirmationPageEvmFields extends ConfirmationPageFields {
  name: string;
}

export interface EvmConfirmationPageGasFee {
  gasLimit: number;
  gasFee: GasFeeEstimationBase;
}
