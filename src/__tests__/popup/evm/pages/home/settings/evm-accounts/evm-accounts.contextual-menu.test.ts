import { SVGIcons } from 'src/common-ui/icons.enum';
import { EvmAccountsContextualMenu } from 'src/popup/evm/pages/home/settings/evm-accounts/evm-accounts.contextual-menu';

describe('EvmAccountsContextualMenu', () => {
  const getMenu = (params?: {
    isLedgerSource?: boolean;
    isImportedSource?: boolean;
  }) =>
    EvmAccountsContextualMenu({
      activeSeedName: 'Ledger',
      onEditClicked: jest.fn(),
      onDeleteClicked: jest.fn(),
      onCreateClicked: jest.fn(),
      onImportClicked: jest.fn(),
      onImportKeyClicked: jest.fn(),
      onConnectLedgerClicked: jest.fn(),
      onCopyClicked: jest.fn(),
      isLedgerSource: params?.isLedgerSource,
      isImportedSource: params?.isImportedSource,
    });

  it('removes seed edit and copy actions for Ledger sources', () => {
    const menu = getMenu({ isLedgerSource: true });

    expect(menu.sections[0].items.map((item) => item.label)).toEqual([
      'evm_delete_seed_button',
    ]);
  });

  it('removes seed edit and copy actions for Imported sources', () => {
    const menu = getMenu({ isImportedSource: true });

    expect(menu.sections[0].items.map((item) => item.label)).toEqual([
      'evm_delete_seed_button',
    ]);
  });

  it('uses the EVM-sized Ledger icon for the Connect Ledger action', () => {
    const menu = getMenu();
    const connectLedgerItem = menu.sections[1].items.find(
      (item) => item.label === 'evm_connect_ledger_wallet',
    );

    expect(connectLedgerItem?.icon).toBe(SVGIcons.EVM_ACCOUNT_LEDGER);
  });

  it('uses a distinct import icon for the Import seed action', () => {
    const menu = getMenu();
    const importItem = menu.sections[1].items.find(
      (item) => item.label === 'evm_import_seed',
    );

    expect(importItem?.icon).toBe(SVGIcons.EVM_ACCOUNT_IMPORT);
  });

  it('adds the Import key action to the seed menu', () => {
    const menu = getMenu();
    const importKeyItem = menu.sections[1].items.find(
      (item) => item.label === 'evm_import_key',
    );

    expect(menu.sections[1].items.map((item) => item.label)).toContain(
      'evm_import_key',
    );
    expect(importKeyItem?.icon).toBe(SVGIcons.EVM_ACCOUNT_KEY);
  });
});
