import { Screen } from '@interfaces/screen.interface';
import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/fake-store';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';
import { AddWalletMainComponent } from 'src/popup/evm/pages/add-wallets/add-wallets-main.component';
import { EvmScreen } from 'src/popup/evm/reference-data/evm-screen.enum';
import { ChainType } from 'src/popup/multichain/interfaces/chains.interface';

describe('AddWalletMainComponent', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderSetupPage = (isLedgerSupported = true) =>
    customRender(<AddWalletMainComponent />, {
      initialState: {
        ...initialEmptyStateStore,
        chain: {
          ...initialEmptyStateStore.chain,
          type: ChainType.EVM,
          chainId: '0x1',
          name: 'Ethereum',
        },
        evm: {
          ...initialEmptyStateStore.evm,
          appStatus: {
            ...initialEmptyStateStore.evm.appStatus,
            isLedgerSupported,
          },
        },
      },
    });

  it('renders import private key and ledger options on the setup page', () => {
    renderSetupPage();

    expect(
      screen.getByTestId('import-evm-wallet-from-key-button'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('add-evm-wallet-from-ledger-button'),
    ).toBeInTheDocument();
  });

  it('hides the ledger option when Ledger is not supported', () => {
    renderSetupPage(false);

    expect(
      screen.queryByTestId('add-evm-wallet-from-ledger-button'),
    ).not.toBeInTheDocument();
  });

  it('navigates to import wallet from private key', async () => {
    const user = userEvent.setup();
    const { store } = renderSetupPage();

    await user.click(screen.getByTestId('import-evm-wallet-from-key-button'));

    await waitFor(() => {
      expect(store.getState().navigation.stack[0]?.currentPage).toBe(
        EvmScreen.IMPORT_EVM_WALLET_FROM_KEY,
      );
    });
  });

  it('navigates to the Ledger add-accounts page in the popup', async () => {
    const user = userEvent.setup();
    const { store } = renderSetupPage();

    await user.click(screen.getByTestId('add-evm-wallet-from-ledger-button'));

    await waitFor(() => {
      expect(store.getState().navigation.stack[0]?.currentPage).toBe(
        EvmScreen.EVM_ADD_ACCOUNTS_FROM_LEDGER,
      );
    });
  });

  it('renders on the EVM add wallet main screen', () => {
    renderSetupPage();

    expect(
      screen.getByTestId(`${Screen.EVM_ADD_WALLET_MAIN}-page`),
    ).toBeInTheDocument();
  });
});
