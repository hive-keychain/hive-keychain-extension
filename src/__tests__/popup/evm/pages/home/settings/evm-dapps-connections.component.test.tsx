import '@testing-library/jest-dom';
import { EvmRequestPermission } from '@background/evm/evm-methods/evm-permission.list';
import { emitAccountsChangedIfNeeded } from '@background/evm/evm-provider-state.utils';
import { EvmWalletPermissions } from '@interfaces/evm-provider.interface';
import {
  EvmDappsConnectionsComponent,
  getEvmDappConnections,
  getEvmDappFaviconUrl,
  removeEvmDappConnectionAccounts,
} from '@popup/evm/pages/home/settings/evm-dapps-connections/evm-dapps-connections.component';
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

    const connections = getEvmDappConnections(walletPermissions, [
      localAccount,
    ]);

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

  it('builds the favicon URL from the subdomain', () => {
    expect(getEvmDappFaviconUrl('app.example.com')).toBe(
      'https://www.google.com/s2/favicons?domain=app.example.com&sz=256',
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
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValueOnce({
        'zeta.example': {
          [EvmRequestPermission.ETH_ACCOUNTS]: [staleAddress],
        },
        'https://alpha.example': {
          [EvmRequestPermission.ETH_ACCOUNTS]: [localAccount.wallet.address],
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
      'https://www.google.com/s2/favicons?domain=alpha.example&sz=256',
    );
    expect(screen.queryByTestId('evm-account-display')).not.toBeInTheDocument();

    await user.click(screen.getByText('alpha.example'));

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

  it('renders the empty state when there are no valid connections', async () => {
    const localAccount = createAccount(
      '0x1111111111111111111111111111111111111111',
    );

    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValueOnce({});

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
