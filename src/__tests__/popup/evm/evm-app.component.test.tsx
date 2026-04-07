import { Screen } from '@interfaces/screen.interface';
import { ChainType, EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { act, waitFor } from '@testing-library/react';
import React from 'react';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/fake-store';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';
import { EvmActiveAccountUtils } from 'src/popup/evm/utils/evm-active-account.utils';
import { EvmWalletUtils } from 'src/popup/evm/utils/wallet.utils';
import { EvmAppComponent } from 'src/popup/evm/evm-app.component';

jest.mock('@popup/evm/evm-router.component', () => {
  const React = require('react');
  return {
    EvmRouterComponent: () =>
      React.createElement('div', { 'data-testid': 'evm-router' }),
  };
});

jest.mock('@popup/evm/actions/active-account.actions', () => ({
  loadEvmActiveAccount: jest.fn(() => ({
    type: 'TEST/LOAD_EVM_ACTIVE_ACCOUNT',
  })),
}));

const createDeferred = <T,>() => {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((resolver) => {
    resolve = resolver;
  });
  return { promise, resolve };
};

const evmChainFixture: EvmChain = {
  name: 'Ethereum',
  type: ChainType.EVM,
  logo: '',
  chainId: '0x1',
  rpcs: [],
  mainToken: 'ETH',
  defaultTransactionType: 2 as any,
};

describe('EvmApp startup', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.restoreAllMocks();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('shows only the splashscreen until EVM startup is ready', async () => {
    const accountsDeferred = createDeferred<any[]>();

    jest
      .spyOn(EvmWalletUtils, 'rebuildAccountsFromLocalStorage')
      .mockImplementation(() => accountsDeferred.promise);
    jest
      .spyOn(EvmActiveAccountUtils, 'getSavedActiveAccountWallet')
      .mockResolvedValue({ address: '0x123' } as any);

    const { container, queryByTestId, store } = customRender(<EvmAppComponent />, {
      initialState: {
        ...initialEmptyStateStore,
        mk: 'mk',
        chain: evmChainFixture,
      },
    });

    await act(async () => {
      jest.runOnlyPendingTimers();
      await Promise.resolve();
    });

    expect(container.querySelector('.splashscreen')).not.toBeNull();
    expect(queryByTestId('evm-router')).toBeNull();
    expect(store.getState().navigation.stack[0]).toBeUndefined();

    accountsDeferred.resolve([
      {
        id: 0,
        path: "m/44'/60'/0'/0/0",
        seedId: 1,
        wallet: { address: '0x123' },
      },
    ]);

    await act(async () => {
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(store.getState().navigation.stack[0]?.currentPage).toBe(
        Screen.HOME_PAGE,
      );
    });
  });
});
