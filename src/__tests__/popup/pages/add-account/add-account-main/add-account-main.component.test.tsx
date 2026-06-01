import { Screen } from '@interfaces/screen.interface';
import '@testing-library/jest-dom';
import { act, cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/fake-store';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';
import { Icons } from 'src/common-ui/icons.enum';
import { EvmChainUtils } from 'src/popup/evm/utils/evm-chain.utils';
import { EvmWalletUtils } from 'src/popup/evm/utils/wallet.utils';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';
import { AddAccountMainComponent } from 'src/popup/hive/pages/add-account/add-account-main/add-account-main.component';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import { ChainType } from 'src/popup/multichain/interfaces/chains.interface';
import { BackgroundCommand } from 'src/reference-data/background-message-key.enum';

describe('add-account-main.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });

  describe('No Accounts cases: ', () => {
    beforeEach(async () => {
      const base = initialStates.iniStateAs.defaultExistent;
      await reactTestingLibrary.renderWithConfiguration(
        <HiveAppComponent />,
        {
          ...base,
          hive: { ...base.hive, accounts: [] },
        },
        {
          app: {
            accountsRelated: {
              AccountUtils: {
                hasStoredAccounts: false,
              },
            },
          },
        },
      );
    });

    it('Must show add account main page', async () => {
      expect(
        await screen.findByTestId(`${Screen.ACCOUNT_PAGE_INIT_ACCOUNT}-page`),
      ).toBeInTheDocument();
    });

    it('Must navigate to add-by-keys', async () => {
      await act(async () => {
        await userEvent.click(
          await screen.findByText('Use a private key or master password'),
        );
      });
      expect(
        await screen.findByTestId(`${Screen.ACCOUNT_PAGE_ADD_BY_KEYS}-page`),
      ).toBeInTheDocument();
    });

    it('Must hide create account without an existing Hive account', async () => {
      expect(screen.queryByText('Create account')).not.toBeInTheDocument();
    });
  });

  describe('Accounts cases', () => {
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <HiveAppComponent />,
        {
          ...initialStates.iniStateAs.defaultExistent,
          accounts: accounts.twoAccounts,
        },
        {
          app: {
            accountsRelated: {
              AccountUtils: {
                hasStoredAccounts: true,
              },
            },
          },
        },
      );
      await act(async () => {
        await userEvent.click(await screen.findByTestId('clickable-settings'));
        await userEvent.click(
          await screen.findByTestId(
            'menu-settings-button-' + Icons.ACCOUNTS,
          ),
        );
        await userEvent.click(
          await screen.findByTestId(
            'menu-settings-button-' + Icons.ADD_ACCOUNT,
          ),
        );
      });
    });

    it('Must navigate to add-by-auth', async () => {
      await act(async () => {
        await userEvent.click(
          await screen.findByText('Use an authorized account'),
        );
      });
      expect(
        await screen.findByTestId(`${Screen.ACCOUNT_PAGE_ADD_BY_AUTH}-page`),
      ).toBeInTheDocument();
    });

    it('Must navigate to create account', async () => {
      await act(async () => {
        await userEvent.click(await screen.findByText('Create account'));
      });
      expect(
        await screen.findByTestId(`${Screen.CREATE_ACCOUNT_PAGE_STEP_ONE}-page`),
      ).toBeInTheDocument();
    });
  });

  describe('Chain type selector cases', () => {
    const evmChain = {
      name: 'Ethereum',
      type: ChainType.EVM,
      chainId: '0x1',
      logo: '',
      rpcs: [{ url: 'https://eth.example' }],
      mainToken: 'ETH',
    };

    beforeEach(() => {
      jest.spyOn(EvmChainUtils, 'getLastEvmChain').mockResolvedValue(evmChain);
      jest.spyOn(EvmChainUtils, 'getEthChain').mockResolvedValue(evmChain);
    });

    it('shows Hive options by default and EVM options when selecting EVM', async () => {
      customRender(<AddAccountMainComponent />, {
        initialState: {
          ...initialEmptyStateStore,
          hive: {
            ...initialEmptyStateStore.hive,
            accounts: accounts.twoAccounts,
          },
        },
      });

      expect(
        screen.getByText('Use a private key or master password'),
      ).toBeInTheDocument();
      expect(screen.getByText('Create account')).toBeInTheDocument();

      await userEvent.click(screen.getByTestId('add-account-type-evm'));

      expect(
        screen.queryByText('Use a private key or master password'),
      ).not.toBeInTheDocument();
      expect(
        screen.getByText('Import from a seedphrase'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Import keys from a .kc file'),
      ).toBeInTheDocument();
      expect(screen.getByText('Import from a private key')).toBeInTheDocument();
      expect(screen.getByText('Create a new EVM wallet')).toBeInTheDocument();
    });

    it('switches to an EVM chain before navigating to an EVM add method', async () => {
      const { store } = customRender(<AddAccountMainComponent />, {
        initialState: {
          ...initialEmptyStateStore,
          hive: {
            ...initialEmptyStateStore.hive,
            accounts: accounts.twoAccounts,
          },
        },
      });

      await userEvent.click(screen.getByTestId('add-account-type-evm'));
      await userEvent.click(screen.getByText('Import from a private key'));

      await waitFor(() => {
        expect(store.getState().chain.type).toBe(ChainType.EVM);
        expect(store.getState().navigation.stack[0].currentPage).toBe(
          Screen.IMPORT_EVM_WALLET_FROM_KEY,
        );
      });
    });

    it('refreshes both Hive and EVM stores on multichain import success callback', async () => {
      const importedHiveAccounts = [accounts.local.one];
      const importedEvmAccounts = [
        {
          id: 0,
          seedId: 1,
          wallet: { address: '0x1234567890123456789012345678901234567890' },
          source: 'seed',
        },
      ] as any;
      const invalidateEvmAccountsCacheSpy = jest.spyOn(
        EvmWalletUtils,
        'invalidateRebuildAccountsCache',
      );
      jest
        .spyOn(EvmWalletUtils, 'rebuildAccountsFromLocalStorage')
        .mockResolvedValue(importedEvmAccounts);
      jest
        .spyOn(AccountUtils, 'getAccountsFromLocalStorage')
        .mockResolvedValue(importedHiveAccounts);

      let onMessageListener: ((message: any) => Promise<void>) | undefined;
      jest
        .spyOn(chrome.runtime.onMessage, 'addListener')
        .mockImplementation((listener: any) => {
          onMessageListener = listener;
        });
      jest
        .spyOn(chrome.windows, 'getCurrent')
        .mockImplementation((callback: any) =>
          callback({ width: 400, left: 0, top: 0 }),
        );
      jest.spyOn(chrome.windows, 'create').mockResolvedValue({ id: 1 } as any);

      const { store } = customRender(<AddAccountMainComponent />, {
        initialState: {
          ...initialEmptyStateStore,
          mk: 'mk',
          chain: initialEmptyStateStore.chain,
          hive: {
            ...initialEmptyStateStore.hive,
            accounts: [],
          },
          evm: {
            ...initialEmptyStateStore.evm,
            accounts: [],
            appStatus: {
              ...initialEmptyStateStore.evm.appStatus,
              isLedgerSupported: false,
            },
          },
        },
      });

      await userEvent.click(screen.getByText('Import keys from a .kc file'));
      expect(onMessageListener).toBeDefined();

      await act(async () => {
        await onMessageListener!({
          command: BackgroundCommand.SEND_BACK_IMPORTED_ACCOUNTS,
          value: {
            success: true,
            accountType: 'all',
            accounts: importedHiveAccounts,
          },
        });
      });

      await waitFor(() => {
        expect(store.getState().hive.accounts).toEqual(importedHiveAccounts);
        expect(EvmWalletUtils.rebuildAccountsFromLocalStorage).toHaveBeenCalledWith(
          'mk',
        );
        expect(invalidateEvmAccountsCacheSpy).toHaveBeenCalled();
        expect(store.getState().navigation.stack[0].currentPage).toBe(
          Screen.HOME_PAGE,
        );
      });
    });
  });
});
