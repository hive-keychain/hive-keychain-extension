import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import AddEvmAccountsComponent from 'src/ledger/add-evm-accounts/add-evm-accounts.component';
import {
  EvmAccountSource,
  EvmLedgerDerivationMode,
} from 'src/popup/evm/interfaces/wallet.interface';
import { EvmLedgerUtils } from 'src/popup/evm/utils/evm-ledger.utils';
import { EvmWalletUtils } from 'src/popup/evm/utils/wallet.utils';
import { EvmChainUtils } from 'src/popup/evm/utils/evm-chain.utils';
import { EvmLightNodeUtils } from 'src/popup/evm/utils/evm-light-node.utils';
import { ChainUtils } from 'src/popup/multichain/utils/chain.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import VaultUtils from 'src/utils/vault.utils';

import { I18nUtils } from 'src/utils/i18n.utils';
jest.mock('src/common-ui/loading/loading.component', () => ({
  LoadingComponent: ({ hide }: any) =>
    hide ? null : <div data-testid="loading" />,
}));

jest.mock('src/common-ui/svg-icon/svg-icon.component', () => ({
  SVGIcon: () => <span data-testid="svg-icon" />,
}));

describe('AddEvmAccountsComponent', () => {
  const chain = {
    chainId: '0x1',
    mainToken: 'ETH',
  };

  const buildLedgerAccount = (
    address: string,
    path: string,
    derivationMode = EvmLedgerDerivationMode.BIP44,
    index = 0,
  ) =>
    ({
      address,
      path,
      source: EvmAccountSource.LEDGER,
      derivationMode,
      wallet: {
        address,
        path,
        index,
        source: EvmAccountSource.LEDGER,
        derivationMode,
      },
    }) as any;

  beforeEach(() => {
    jest.clearAllMocks();
    window.history.pushState(
      {},
      '',
      '/popup.html?chainId=0x1',
    );
    I18nUtils.getMessage = jest.fn((key: string, params?: string[]) =>
      params?.length ? `${key}:${params.join('|')}` : key,
    );
    jest
      .spyOn(LocalStorageUtils, 'getMultipleValueFromLocalStorage')
      .mockResolvedValue({ ACTIVE_THEME: 'light' } as any);
    jest.spyOn(ChainUtils, 'getChain').mockResolvedValue(chain as any);
    jest.spyOn(EvmChainUtils, 'getLastEvmChain').mockResolvedValue(chain as any);
    jest.spyOn(VaultUtils, 'getValueFromVault').mockResolvedValue('mk');
    jest.spyOn(EvmLedgerUtils, 'init').mockResolvedValue(true);
    jest.spyOn(EvmLedgerUtils, 'discoverAccounts').mockResolvedValue([]);
    jest.spyOn(EvmLightNodeUtils, 'registerAddress').mockResolvedValue(
      undefined as any,
    );
    jest.spyOn(EvmWalletUtils, 'addLedgerAccounts').mockResolvedValue([]);
  });

  it('uses the MetaMask/BIP44 derivation preset by default and starts after existing BIP44 accounts', async () => {
    jest
      .spyOn(EvmWalletUtils, 'rebuildAccountsFromLocalStorage')
      .mockResolvedValue([
        buildLedgerAccount(
          '0x0000000000000000000000000000000000000001',
          "m/44'/60'/0'/0/0",
          EvmLedgerDerivationMode.BIP44,
          0,
        ),
        buildLedgerAccount(
          '0x0000000000000000000000000000000000000002',
          "m/44'/60'/0'/0/1",
          EvmLedgerDerivationMode.BIP44,
          1,
        ),
      ]);

    render(<AddEvmAccountsComponent />);

    await waitFor(() =>
      expect(
        screen.getByText('evm_ledger_derivation_next_index:2'),
      ).toBeTruthy(),
    );
    fireEvent.click(screen.getByText('synchronize_ledger_button'));

    await waitFor(() =>
      expect(EvmLedgerUtils.discoverAccounts).toHaveBeenCalledWith(chain, {
        derivationMode: EvmLedgerDerivationMode.BIP44,
        startIndex: 2,
      }),
    );
  });

  it('discovers with the selected Ledger Live preset and its next index', async () => {
    jest
      .spyOn(EvmWalletUtils, 'rebuildAccountsFromLocalStorage')
      .mockResolvedValue([
        buildLedgerAccount(
          '0x0000000000000000000000000000000000000003',
          "m/44'/60'/1'/0/0",
          EvmLedgerDerivationMode.LEDGER_LIVE,
          1,
        ),
      ]);

    render(<AddEvmAccountsComponent />);

    await waitFor(() =>
      expect(
        screen.getByTestId('evm-ledger-derivation-ledger_live'),
      ).toBeTruthy(),
    );
    fireEvent.click(screen.getByTestId('evm-ledger-derivation-ledger_live'));
    await waitFor(() =>
      expect(
        screen.getByText('evm_ledger_derivation_next_index:2'),
      ).toBeTruthy(),
    );
    fireEvent.click(screen.getByText('synchronize_ledger_button'));

    await waitFor(() =>
      expect(EvmLedgerUtils.discoverAccounts).toHaveBeenCalledWith(chain, {
        derivationMode: EvmLedgerDerivationMode.LEDGER_LIVE,
        startIndex: 2,
      }),
    );
  });

  it('shows the already imported message when all discovered accounts are filtered out', async () => {
    const importedAddress = '0x0000000000000000000000000000000000000004';
    jest
      .spyOn(EvmWalletUtils, 'rebuildAccountsFromLocalStorage')
      .mockResolvedValue([
        buildLedgerAccount(
          importedAddress,
          "m/44'/60'/0'/0/0",
          EvmLedgerDerivationMode.BIP44,
          0,
        ),
      ]);
    jest.spyOn(EvmLedgerUtils, 'discoverAccounts').mockResolvedValue([
      {
        wallet: {
          address: importedAddress,
          path: "m/44'/60'/0'/0/1",
          index: 1,
          source: EvmAccountSource.LEDGER,
          derivationMode: EvmLedgerDerivationMode.BIP44,
        },
        balance: 0,
        selected: true,
      },
    ]);

    render(<AddEvmAccountsComponent />);

    await waitFor(() =>
      expect(
        screen.getByText('evm_ledger_derivation_next_index:1'),
      ).toBeTruthy(),
    );
    fireEvent.click(screen.getByText('synchronize_ledger_button'));

    await waitFor(() =>
      expect(
        screen.getByText('all_ledger_accounts_already_imported'),
      ).toBeTruthy(),
    );
  });
});
