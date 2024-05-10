import { KeychainKeyTypes } from '@interfaces/keychain.interface';

export interface ConfirmationPageParams {
  fields: ConfirmationPageFields[];
  message: string;
  warningMessage?: string;
  warningParams?: string[];
  skipWarningTranslation?: boolean;
  title: string;
  skipTitleTranslation?: boolean;
  afterConfirmAction: () => {};
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
