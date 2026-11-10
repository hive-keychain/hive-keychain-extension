import { TransactionConfirmationField } from '@popup/evm/interfaces/evm-transactions.interface';

const ACCOUNT_FIELD_NAME = 'dialog_account';
const FROM_FIELD_NAMES = ['evm_operation_from', 'from'];

const PRIORITY_FIELD_NAMES = [
  ['evm_chain'],
  ['dialog_evm_domain'],
  [
    'evm_operation_smart_contract_address',
    'dialog_evm_sign_request_interacting_with',
  ],
  ['dialog_account', 'evm_target_account'],
];

const normalizeEvmAddress = (address?: string) => address?.toLowerCase();

export const removeMatchingFromField = (
  fields: TransactionConfirmationField[] = [],
) => {
  const accountAddress = normalizeEvmAddress(
    fields.find((field) => field.name === ACCOUNT_FIELD_NAME)?.address,
  );

  if (!accountAddress) {
    return fields;
  }

  return fields.filter((field) => {
    if (!FROM_FIELD_NAMES.includes(field.name)) {
      return true;
    }

    return normalizeEvmAddress(field.address) !== accountAddress;
  });
};

export const reorderEvmConfirmationFields = (
  fields: TransactionConfirmationField[] = [],
) => {
  if (fields.length <= 1) {
    return fields;
  }

  const prioritizedFields = PRIORITY_FIELD_NAMES.map(
    () => [] as TransactionConfirmationField[],
  );
  const remainingFields: TransactionConfirmationField[] = [];

  for (const field of fields) {
    const priorityIndex = PRIORITY_FIELD_NAMES.findIndex((priorityNames) =>
      priorityNames.includes(field.name),
    );

    if (priorityIndex === -1) {
      remainingFields.push(field);
    } else {
      prioritizedFields[priorityIndex].push(field);
    }
  }

  return [...prioritizedFields.flat(), ...remainingFields];
};
