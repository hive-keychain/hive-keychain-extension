export interface ConfirmationPageFields {
  label: string;
  value: string;
  labelParams?: string[];
  valueParams?: string[];
  valueClassName?: string;
  tag?: ConfirmationPageFieldType;
  tokenSymbol?: string;
  iconPosition?: 'left' | 'right';
}

export enum ConfirmationPageFieldType {
  USERNAME = 'username',
  BALANCE = 'balance',
  AMOUNT = 'amount',
  OPERATION_TYPE = 'operation_type',
}
