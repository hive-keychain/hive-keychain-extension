import { SVGIcons } from 'src/common-ui/icons.enum';
import { EvmAccountsContextualMenu } from 'src/popup/evm/pages/home/settings/evm-accounts/evm-accounts.contextual-menu';

describe('EvmAccountsContextualMenu', () => {
  const getMenu = (isLedgerSource: boolean) =>
    EvmAccountsContextualMenu({
      activeSeedName: 'Ledger',
      onEditClicked: jest.fn(),
      onDeleteClicked: jest.fn(),
      onCreateClicked: jest.fn(),
      onImportClicked: jest.fn(),
      onConnectLedgerClicked: jest.fn(),
      onCopyClicked: jest.fn(),
      isLedgerSource,
    });

  it('removes seed edit and copy actions for Ledger sources', () => {
    const menu = getMenu(true);

    expect(menu.sections[0].items.map((item) => item.label)).toEqual([
      'evm_delete_seed_button',
    ]);
  });

  it('uses the EVM-sized Ledger icon for the Connect Ledger action', () => {
    const menu = getMenu(false);
    const connectLedgerItem = menu.sections[1].items.find(
      (item) => item.label === 'evm_connect_ledger_wallet',
    );

    expect(connectLedgerItem?.icon).toBe(SVGIcons.EVM_ACCOUNT_LEDGER);
  });

  it('uses a distinct import icon for the Import seed action', () => {
    const menu = getMenu(false);
    const importItem = menu.sections[1].items.find(
      (item) => item.label === 'evm_import_seed',
    );

    expect(importItem?.icon).toBe(SVGIcons.EVM_ACCOUNT_IMPORT);
  });
});
