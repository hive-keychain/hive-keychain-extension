import { KeychainKeyTypes } from '@interfaces/keychain.interface';
import {
  EvmTransactionInfo,
  EvmTransactionWarning,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmSmartContractInfoNative } from '@popup/evm/interfaces/evm-tokens.interface';
import { GasFeeEstimationBase } from '@popup/evm/interfaces/gas-fee.interface';
import { EvmActiveAccount } from '@popup/evm/interfaces/active-account.interface';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';

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
  prefetchedMainTokenInfo?: EvmSmartContractInfoNative;
  activeAccountOverride?: EvmActiveAccount;
  chainOverride?: EvmChain;
}

export interface HiveConfirmationPageParams extends ConfirmationPageParams {
  method: KeychainKeyTypes | null;
  /** Preserved when returning to manage accounts after confirmation. */
  manageAccountSelectedName?: string;
}

export interface ConfirmationPageFields {
  label?: string;
  value: string | JSX.Element;
  labelParams?: string[];
  valueParams?: string[];
  valueClassName?: string;
  warnings?: TransactionWarning[];
  info?: TransactionInfo[];
  tokenSymbol?: string;
  tag?: ConfirmationPageFieldType;
  iconPosition?: 'left' | 'right';
}

export interface ConfirmationPageEvmFields extends ConfirmationPageFields {
  name: string;
}

export interface EvmConfirmationPageGasFee {
  gasLimit: number;
  gasFee: GasFeeEstimationBase;
}

export enum ConfirmationPageFieldType {
  USERNAME = 'username',
  BALANCE = 'balance',
  AMOUNT = 'amount',
  OPERATION_TYPE = 'operation_type',
}
