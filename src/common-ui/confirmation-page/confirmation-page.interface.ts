import { KeychainKeyTypes } from '@interfaces/keychain.interface';
import { GasFeeEstimation } from '@popup/evm/interfaces/gas-fee.interface';

export interface ConfirmationPageParams {
  fields: ConfirmationPageFields[];
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
  value: string;
  labelParams?: string[];
  valueParams?: string[];
  valueClassName?: string;
}

export interface EvmConfirmationPageGasFee {
  gasLimit: number;
  gasFee: GasFeeEstimation;
}
