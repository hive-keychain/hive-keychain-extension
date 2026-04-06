import { TransactionConfirmationField } from '@popup/evm/interfaces/evm-transactions.interface';

const PRIORITY_FIELD_NAMES = [
  ['evm_chain'],
  ['dialog_evm_domain'],
  [
    'evm_operation_smart_contract_address',
    'dialog_evm_sign_request_interacting_with',
  ],
  ['dialog_account', 'evm_target_account'],
];

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
