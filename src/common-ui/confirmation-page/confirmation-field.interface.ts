export interface ConfirmationPageFields {
  label: string;
  value: string;
  labelParams?: string[];
  valueParams?: string[];
  valueClassName?: string;
  tag?: ConfirmationPageFieldTag;
  tokenSymbol?: string;
  iconPosition?: 'left' | 'right';
}

export enum ConfirmationPageFieldTag {
  USERNAME = 'username',
  BALANCE = 'balance',
  AMOUNT = 'amount',
  OPERATION_TYPE = 'operation_type',
}
