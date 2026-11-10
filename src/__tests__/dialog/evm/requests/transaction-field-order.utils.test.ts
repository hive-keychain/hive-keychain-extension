import {
  removeMatchingFromField,
  reorderEvmConfirmationFields,
} from 'src/dialog/evm/requests/transaction-warnings/transaction-field-order.utils';

describe('reorderEvmConfirmationFields', () => {
  it('moves typed-data contract and account rows into the shared priority order', () => {
    const fields = [
      { name: 'random_a', type: 'string', value: 'A' },
      { name: 'evm_target_account', type: 'string', value: 'Account' },
      { name: 'dialog_evm_sign_request_interacting_with', type: 'string', value: 'Contract' },
      { name: 'dialog_evm_domain', type: 'string', value: 'Domain' },
      { name: 'random_b', type: 'string', value: 'B' },
    ] as any[];

    expect(reorderEvmConfirmationFields(fields).map((field) => field.name)).toEqual([
      'dialog_evm_domain',
      'dialog_evm_sign_request_interacting_with',
      'evm_target_account',
      'random_a',
      'random_b',
    ]);
  });

  it('keeps non-priority fields stable and collapses to chain, domain, account when no contract field exists', () => {
    const fields = [
      { name: 'random_a', type: 'string', value: 'A' },
      { name: 'dialog_account', type: 'string', value: 'Account' },
      { name: 'random_b', type: 'string', value: 'B' },
      { name: 'dialog_evm_domain', type: 'string', value: 'Domain' },
      { name: 'evm_chain', type: 'string', value: 'Chain' },
    ] as any[];

    expect(reorderEvmConfirmationFields(fields).map((field) => field.name)).toEqual([
      'evm_chain',
      'dialog_evm_domain',
      'dialog_account',
      'random_a',
      'random_b',
    ]);
  });
});

describe('removeMatchingFromField', () => {
  it('removes EVM From when it matches Account case-insensitively', () => {
    const fields = [
      {
        address: '0x00000000000000000000000000000000000000ff',
        name: 'dialog_account',
        type: 'wallet-address',
        value: 'Account',
      },
      {
        address: '0x00000000000000000000000000000000000000FF',
        name: 'evm_operation_from',
        type: 'wallet-address',
        value: 'From',
      },
      {
        address: '0x00000000000000000000000000000000000000ab',
        name: 'evm_operation_to',
        type: 'wallet-address',
        value: 'To',
      },
    ] as any[];

    expect(removeMatchingFromField(fields).map((field) => field.name)).toEqual([
      'dialog_account',
      'evm_operation_to',
    ]);
  });

  it('keeps From when it differs from Account', () => {
    const fields = [
      {
        address: '0x00000000000000000000000000000000000000ff',
        name: 'dialog_account',
        type: 'wallet-address',
        value: 'Account',
      },
      {
        address: '0x00000000000000000000000000000000000000aa',
        name: 'from',
        type: 'wallet-address',
        value: 'From',
      },
    ] as any[];

    expect(removeMatchingFromField(fields).map((field) => field.name)).toEqual([
      'dialog_account',
      'from',
    ]);
  });
});
