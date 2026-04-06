import { reorderEvmConfirmationFields } from 'src/dialog/evm/requests/transaction-warnings/transaction-field-order.utils';

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
