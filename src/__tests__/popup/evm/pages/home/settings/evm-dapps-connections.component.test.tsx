import '@testing-library/jest-dom';
import { EvmRequestPermission } from '@background/evm/evm-methods/evm-permission.list';
import { emitAccountsChangedIfNeeded } from '@background/evm/evm-provider-state.utils';
import { EvmWalletPermissions } from '@interfaces/evm-provider.interface';
import {
  EvmDappsConnectionsComponent,
  getEvmDappConnections,
  parseEvmOriginChainWhitelist,
  removeEvmDappConnectionAccounts,
  removeEvmDappConnectionChains,
} from '@popup/evm/pages/home/settings/evm-dapps-connections/evm-dapps-connections.component';
import { EvmDappUtils } from '@popup/evm/utils/evm-dapp.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Provider } from 'react-redux';
import {
  getFakeStore,
  initialEmptyStateStore,
} from 'src/__tests__/utils-for-testing/fake-store';
import { EvmAccount } from 'src/popup/evm/interfaces/wallet.interface';
import LocalStorageUtils from 'src/utils/localStorage.utils';

jest.mock('@background/evm/evm-provider-state.utils', () => ({
  emitAccountsChangedIfNeeded: jest.fn().mockResolvedValue([]),
}));

jest.mock(
  'src/common-ui/evm/evm-account-display/evm-account-display.component',
  () => ({
    EvmAccountDisplayComponent: ({ account }: { account: EvmAccount }) => (
      <div data-testid="evm-account-display">{account.wallet.address}</div>
    ),
  }),
);

jest.mock('src/common-ui/evm/dapp-status/dapp-status.component', () => ({
  DappStatusComponent: ({ address }: { address?: string }) => (
    <div data-testid="evm-dapp-status">{address}</div>
  ),
}));

jest.mock('src/common-ui/svg-icon/svg-icon.component', () => ({
  SVGIcon: ({
    className,
    onClick,
  }: {
    className?: string;
    onClick?: () => void;
  }) => (
    <button
      data-testid={
        className === 'account-section-icon'
          ? 'evm-dapps-remove-account'
          : 'evm-dapps-modal-close'
      }
      onClick={onClick}
    />
  ),
}));

const createAccount = (address: string): EvmAccount =>
  ({
    id: 0,
    path: "m/44'/60'/0'/0/0",
    seedId: 1,
    wallet: { address },
  }) as EvmAccount;

describe('EvmDappsConnectionsComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(chrome.i18n, 'getMessage').mockImplementation((key) => key);
  });

  it('builds sorted hostname connections from eth_accounts permissions only', () => {
    const localAccount = createAccount(
      '0x1111111111111111111111111111111111111111',
    );
    const staleAddress = '0x2222222222222222222222222222222222222222';
    const duplicateAddress = '0x3333333333333333333333333333333333333333';
    const walletPermissions: EvmWalletPermissions = {
      'zeta.example': {
        [EvmRequestPermission.ETH_ACCOUNTS]: [staleAddress],
      },
      'https://alpha.example': {
        [EvmRequestPermission.ETH_ACCOUNTS]: [
          localAccount.wallet.address,
          duplicateAddress,
        ],
      },
      'alpha.example': {
        [EvmRequestPermission.ETH_ACCOUNTS]: [
          localAccount.wallet.address,
          duplicateAddress.toUpperCase(),
        ],
      },
      'empty.example': {
        [EvmRequestPermission.ETH_ACCOUNTS]: [],
      },
      'without-accounts.example': {},
    };

    const connections = getEvmDappConnections(
      walletPermissions,
      [localAccount],
      {
        'https://alpha.example': ['0X1', '0x89'],
        'https://zeta.example': ['0x38'],
        'https://other.example': ['0xa'],
      },
    );

    expect(connections.map((connection) => connection.subdomain)).toEqual([
      'alpha.example',
      'zeta.example',
    ]);
    expect(connections[0].sourceKeys).toEqual([
      'https://alpha.example',
      'alpha.example',
    ]);
    expect(connections[0].accounts).toEqual([
      {
        address: localAccount.wallet.address.toLowerCase(),
        account: localAccount,
      },
      {
        address: duplicateAddress,
        account: undefined,
      },
    ]);
    expect(connections[1].accounts[0]).toEqual({
      address: staleAddress.toLowerCase(),
      account: undefined,
    });
    expect(connections[0].chains).toEqual([
      { chainId: '0x1', chain: undefined },
      { chainId: '0x89', chain: undefined },
    ]);
    expect(connections[1].chains).toEqual([
      { chainId: '0x38', chain: undefined },
    ]);
  });

  it('removes one or all connected accounts from grouped hostname permissions', () => {
    const removedAddress = '0x1111111111111111111111111111111111111111';
    const keptAddress = '0x2222222222222222222222222222222222222222';
    const walletPermissions: EvmWalletPermissions = {
      'https://alpha.example': {
        [EvmRequestPermission.ETH_ACCOUNTS]: [removedAddress, keptAddress],
      },
      'alpha.example': {
        [EvmRequestPermission.ETH_ACCOUNTS]: [removedAddress],
      },
      'zeta.example': {
        [EvmRequestPermission.ETH_ACCOUNTS]: [removedAddress],
      },
    };

    const singleRemoval = removeEvmDappConnectionAccounts(
      walletPermissions,
      'alpha.example',
      removedAddress,
    );

    expect(singleRemoval.walletPermissions).toEqual({
      'https://alpha.example': {
        [EvmRequestPermission.ETH_ACCOUNTS]: [keptAddress],
      },
      'alpha.example': {},
      'zeta.example': {
        [EvmRequestPermission.ETH_ACCOUNTS]: [removedAddress],
      },
    });
    expect(singleRemoval.affectedOrigins).toEqual([
      {
        origin: 'https://alpha.example',
        prevAccounts: [removedAddress, keptAddress],
        nextAccounts: [keptAddress],
      },
    ]);

    const allRemoval = removeEvmDappConnectionAccounts(
      walletPermissions,
      'alpha.example',
    );

    expect(allRemoval.walletPermissions).toEqual({
      'https://alpha.example': {},
      'alpha.example': {},
      'zeta.example': {
        [EvmRequestPermission.ETH_ACCOUNTS]: [removedAddress],
      },
    });
  });

  it('normalizes and removes allowed chains from grouped hostname whitelist', () => {
    const originChainWhitelist = parseEvmOriginChainWhitelist({
      'https://alpha.example': ['0X1', '0x89', null],
      'alpha.example': ['0x1'],
      'https://zeta.example': ['0x38'],
      invalid: '0x1',
    });

    expect(originChainWhitelist).toEqual({
      'https://alpha.example': ['0x1', '0x89'],
      'alpha.example': ['0x1'],
      'https://zeta.example': ['0x38'],
    });

    expect(
      removeEvmDappConnectionChains(
        originChainWhitelist,
        'alpha.example',
        '0X1',
      ),
    ).toEqual({
      'https://alpha.example': ['0x89'],
      'https://zeta.example': ['0x38'],
    });

    expect(
      removeEvmDappConnectionChains(originChainWhitelist, 'alpha.example'),
    ).toEqual({
      'https://zeta.example': ['0x38'],
    });
  });

  it('builds the favicon URL from the subdomain', () => {
    expect(EvmDappUtils.getEvmDappFaviconUrl('app.example.com')).toBe(
      'https://www.google.com/s2/favicons?domain=app.example.com&sz=256',
    );
  });

  it('prefers a saved logo URL when present', () => {
    const saved =
      'https://example.com/icon.png';
    expect(
      EvmDappUtils.getEvmDappConnectionIconUrl('app.example.com', {
        'app.example.com': saved,
      }),
    ).toBe(saved);
    expect(EvmDappUtils.getEvmDappConnectionIconUrl('app.example.com', {})).toBe(
      EvmDappUtils.getEvmDappFaviconUrl('app.example.com'),
    );
  });

  it('renders subdomains only and opens connected addresses in a modal', async () => {
    const user = userEvent.setup();
    const localAccount = createAccount(
      '0x1111111111111111111111111111111111111111',
    );
    const unconnectedAccount = createAccount(
      '0x3333333333333333333333333333333333333333',
    );
    const staleAddress = '0x2222222222222222222222222222222222222222';

    jest
      .spyOn(LocalStorageUtils, 'getMultipleValueFromLocalStorage')
      .mockResolvedValueOnce({
        [LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS]: {
          'zeta.example': {
            [EvmRequestPermission.ETH_ACCOUNTS]: [staleAddress],
          },
          'https://alpha.example': {
            [EvmRequestPermission.ETH_ACCOUNTS]: [localAccount.wallet.address],
          },
        },
        [LocalStorageKeyEnum.EVM_DAPPS_LOGO]: {
          'alpha.example': 'https://saved.cdn/wallet-alpha.png',
        },
      });

    const store = getFakeStore({
      ...initialEmptyStateStore,
      evm: {
        ...initialEmptyStateStore.evm,
        accounts: [localAccount, unconnectedAccount],
      },
    });

    render(
      <Provider store={store}>
        <EvmDappsConnectionsComponent />
      </Provider>,
    );

    const subdomains = await screen.findAllByTestId(
      'evm-dapps-connection-subdomain',
    );

    expect(subdomains.map((subdomain) => subdomain.textContent)).toEqual([
      'alpha.example',
      'zeta.example',
    ]);
    expect(screen.getAllByTestId('evm-dapps-connection-favicon')[0]).toHaveAttribute(
      'src',
      'https://saved.cdn/wallet-alpha.png',
    );
    expect(screen.getAllByTestId('evm-dapps-connection-favicon')[1]).toHaveAttribute(
      'src',
      'https://www.google.com/s2/favicons?domain=zeta.example&sz=256',
    );
    expect(screen.queryByTestId('evm-account-display')).not.toBeInTheDocument();

    await user.click(screen.getByText('alpha.example'));
    expect(screen.getByTestId('evm-dapps-open-addresses')).toHaveTextContent(
      'evm_dapps_connections_addresses_option',
    );
    expect(screen.getByTestId('evm-dapps-open-chains')).toHaveTextContent(
      'evm_dapps_connections_chains_option',
    );

    await user.click(screen.getByTestId('evm-dapps-open-addresses'));

    expect(screen.getByTestId('evm-account-display')).toHaveTextContent(
      localAccount.wallet.address,
    );
    expect(
      screen.queryByText(unconnectedAccount.wallet.address),
    ).not.toBeInTheDocument();

    await user.click(screen.getByTestId('evm-dapps-modal-close'));

    await waitFor(() => {
      expect(
        screen.queryByTestId('evm-account-display'),
      ).not.toBeInTheDocument();
    });

    await user.click(screen.getByText('zeta.example'));
    await user.click(screen.getByTestId('evm-dapps-open-addresses'));

    expect(screen.getByTestId('evm-dapps-stale-account')).toHaveTextContent(
      'evm_dapps_connections_unknown_account',
    );
  });

  it('disconnects a single connected address and all connected addresses', async () => {
    const user = userEvent.setup();
    const firstAccount = createAccount(
      '0x1111111111111111111111111111111111111111',
    );
    const secondAccount = createAccount(
      '0x2222222222222222222222222222222222222222',
    );
    let walletPermissions: EvmWalletPermissions = {
      'https://alpha.example': {
        [EvmRequestPermission.ETH_ACCOUNTS]: [
          firstAccount.wallet.address,
          secondAccount.wallet.address,
        ],
      },
      'alpha.example': {
        [EvmRequestPermission.ETH_ACCOUNTS]: [firstAccount.wallet.address],
      },
      'zeta.example': {
        [EvmRequestPermission.ETH_ACCOUNTS]: [firstAccount.wallet.address],
      },
    };

    jest
      .spyOn(LocalStorageUtils, 'getMultipleValueFromLocalStorage')
      .mockImplementation(async () => ({
        [LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS]: walletPermissions,
        [LocalStorageKeyEnum.EVM_DAPPS_LOGO]: {},
      }));
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation(async () => walletPermissions);
    jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockImplementation(async (_key, value) => {
        walletPermissions = value;
      });

    const store = getFakeStore({
      ...initialEmptyStateStore,
      evm: {
        ...initialEmptyStateStore.evm,
        accounts: [firstAccount, secondAccount],
      },
    });

    render(
      <Provider store={store}>
        <EvmDappsConnectionsComponent />
      </Provider>,
    );

    await user.click(await screen.findByText('alpha.example'));
    await user.click(screen.getByTestId('evm-dapps-open-addresses'));
    expect(screen.getAllByTestId('evm-account-display')).toHaveLength(2);

    await act(async () => {
      await user.click(screen.getAllByTestId('evm-dapps-remove-account')[0]);
    });

    await waitFor(() => {
      expect(screen.getAllByTestId('evm-account-display')).toHaveLength(1);
    });
    expect(walletPermissions).toEqual({
      'https://alpha.example': {
        [EvmRequestPermission.ETH_ACCOUNTS]: [secondAccount.wallet.address],
      },
      'alpha.example': {},
      'zeta.example': {
        [EvmRequestPermission.ETH_ACCOUNTS]: [firstAccount.wallet.address],
      },
    });
    expect(emitAccountsChangedIfNeeded).toHaveBeenCalledWith(
      'https://alpha.example',
      [firstAccount.wallet.address, secondAccount.wallet.address],
      [secondAccount.wallet.address],
    );

    await act(async () => {
      await user.click(screen.getByTestId('evm-dapps-disconnect-all'));
    });

    await waitFor(() => {
      expect(screen.queryByTestId('evm-account-display')).not.toBeInTheDocument();
    });
    expect(screen.queryByText('alpha.example')).not.toBeInTheDocument();
    expect(screen.getByText('zeta.example')).toBeInTheDocument();
    expect(walletPermissions).toEqual({
      'https://alpha.example': {},
      'alpha.example': {},
      'zeta.example': {
        [EvmRequestPermission.ETH_ACCOUNTS]: [firstAccount.wallet.address],
      },
    });
  });

  it('opens the allowed chains modal and removes chains from local storage', async () => {
    const user = userEvent.setup();
    const account = createAccount(
      '0x1111111111111111111111111111111111111111',
    );
    const walletPermissions: EvmWalletPermissions = {
      'https://alpha.example': {
        [EvmRequestPermission.ETH_ACCOUNTS]: [account.wallet.address],
      },
    };
    let originChainWhitelist = {
      'https://alpha.example': ['0x1', '0x89'],
      'alpha.example': ['0x1'],
      'https://zeta.example': ['0x38'],
    };

    jest
      .spyOn(LocalStorageUtils, 'getMultipleValueFromLocalStorage')
      .mockImplementation(async () => ({
        [LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS]: walletPermissions,
        [LocalStorageKeyEnum.EVM_DAPPS_LOGO]: {},
        [LocalStorageKeyEnum.EVM_ORIGIN_CHAIN_WHITELIST]:
          originChainWhitelist,
        [LocalStorageKeyEnum.DEFAULT_CHAINS]: [
          {
            chainId: '0x1',
            name: 'Ethereum',
            logo: 'ethereum.svg',
            type: 'EVM',
            rpcs: [],
          },
          {
            chainId: '0x89',
            name: 'Polygon',
            logo: 'polygon.svg',
            type: 'EVM',
            rpcs: [],
          },
        ],
        [LocalStorageKeyEnum.CUSTOM_CHAINS]: [],
      }));
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation(async () => originChainWhitelist);
    jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockImplementation(async (_key, value) => {
        originChainWhitelist = value;
      });

    const store = getFakeStore({
      ...initialEmptyStateStore,
      evm: {
        ...initialEmptyStateStore.evm,
        accounts: [account],
      },
    });

    render(
      <Provider store={store}>
        <EvmDappsConnectionsComponent />
      </Provider>,
    );

    await user.click(await screen.findByText('alpha.example'));
    await user.click(screen.getByTestId('evm-dapps-open-chains'));

    expect(screen.getByText('Ethereum')).toBeInTheDocument();
    expect(screen.getByText('Polygon')).toBeInTheDocument();

    await act(async () => {
      await user.click(screen.getAllByTestId('evm-dapps-remove-account')[0]);
    });

    await waitFor(() => {
      expect(screen.queryByText('Ethereum')).not.toBeInTheDocument();
    });
    expect(originChainWhitelist).toEqual({
      'https://alpha.example': ['0x89'],
      'https://zeta.example': ['0x38'],
    });

    await act(async () => {
      await user.click(screen.getByTestId('evm-dapps-remove-all-chains'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('evm-dapps-no-chains')).toHaveTextContent(
        'evm_dapps_connections_no_chains',
      );
    });
    expect(originChainWhitelist).toEqual({
      'https://zeta.example': ['0x38'],
    });
  });

  it('renders the empty state when there are no valid connections', async () => {
    const localAccount = createAccount(
      '0x1111111111111111111111111111111111111111',
    );

    jest
      .spyOn(LocalStorageUtils, 'getMultipleValueFromLocalStorage')
      .mockResolvedValueOnce({
        [LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS]: {},
        [LocalStorageKeyEnum.EVM_DAPPS_LOGO]: {},
      });

    const emptyStore = getFakeStore({
      ...initialEmptyStateStore,
      evm: {
        ...initialEmptyStateStore.evm,
        accounts: [localAccount],
      },
    });

    render(
      <Provider store={emptyStore}>
        <EvmDappsConnectionsComponent />
      </Provider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId('evm-dapps-connections-empty'),
      ).toHaveTextContent('evm_dapps_connections_empty');
    });
  });
});
