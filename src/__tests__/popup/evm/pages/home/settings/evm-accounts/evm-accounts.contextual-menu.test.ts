import { EvmAccountsContextualMenu } from 'src/popup/evm/pages/home/settings/evm-accounts/evm-accounts.contextual-menu';

describe('EvmAccountsContextualMenu', () => {
  const getMenu = (params?: {
    isLedgerSource?: boolean;
    isImportedSource?: boolean;
    }) =>
    EvmAccountsContextualMenu({
      onEditClicked: jest.fn(),
      onDeleteClicked: jest.fn(),
      onCopyClicked: jest.fn(),
      isLedgerSource: params?.isLedgerSource,
      isImportedSource: params?.isImportedSource,
    });

  it('removes seed edit and copy actions for Ledger sources', () => {
    const menu = getMenu({ isLedgerSource: true });

    expect(menu.sections[0].items.map((item) => item.label)).toEqual([
      'evm_delete_seed_button',
    ]);
    expect(menu.sections[0].items[0].confirmationMessage).toBe(
      'evm_delete_all_ledger_accounts_confirmation_message',
    );
  });

  it('removes seed edit and copy actions for Imported sources', () => {
    const menu = getMenu({ isImportedSource: true });

    expect(menu.sections[0].items.map((item) => item.label)).toEqual([
      'evm_delete_seed_button',
    ]);
    expect(menu.sections[0].items[0].confirmationMessage).toBe(
      'evm_delete_all_imported_accounts_confirmation_message',
    );
  });

  it('uses the seed delete confirmation message for seed sources', () => {
    const menu = getMenu();

    expect(
      menu.sections[0].items.find(
        (item) => item.label === 'evm_delete_seed_button',
      )?.confirmationMessage,
    ).toBe('evm_delete_seed_confirmation_message');
  });

  it('only includes current seed actions', () => {
    const menu = getMenu();

    expect(menu.sections).toHaveLength(1);
    expect(menu.sections[0].title).toBeUndefined();
    expect(menu.sections[0].items.map((item) => item.label)).toEqual([
      'evm_copy_seed',
      'evm_edit_seed_nickname',
      'evm_delete_seed_button',
    ]);
  });
});
