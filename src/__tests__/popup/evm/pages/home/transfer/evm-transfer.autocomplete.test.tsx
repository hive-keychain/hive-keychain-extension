import '@testing-library/jest-dom';
import { act, cleanup, fireEvent } from '@testing-library/react';
import { Screen } from '@interfaces/screen.interface';
import {
  EVMSmartContractType,
  EvmSmartContractInfoNative,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmTransferComponent } from '@popup/evm/pages/home/transfer/evm-transfer.component';
import { EvmAddressesUtils } from '@popup/evm/utils/evm-addresses.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { ChainType } from '@popup/multichain/interfaces/chains.interface';
import React from 'react';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import {
  customRender,
  screen,
  waitFor,
} from 'src/__tests__/utils-for-testing/setups/render';

jest.mock(
  'src/common-ui/_containers/form-container/form-container.component',
  () => ({
    FormContainer: ({ children, onSubmit }: any) => {
      const React = require('react');
      return React.createElement('form', { onSubmit }, children);
    },
  }),
);

jest.mock('src/common-ui/balance-section/balance-section.component', () => ({
  BalanceSectionComponent: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'balance-section' });
  },
}));

jest.mock('src/common-ui/button/button.component', () => ({
  __esModule: true,
  default: ({ label, onClick, dataTestId }: any) => {
    const React = require('react');
    return React.createElement(
      'button',
      { type: 'button', onClick, 'data-testid': dataTestId ?? label },
      label,
    );
  },
}));

jest.mock('src/common-ui/custom-select/custom-select.component', () => ({
  ComplexeCustomSelect: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'token-select' });
  },
}));

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

const hasUnmountedStateUpdateWarning = (
  consoleError: jest.SpyInstance<void, any[]>,
) =>
  consoleError.mock.calls.some((call) =>
    call.some(
      (arg) =>
        typeof arg === 'string' &&
        arg.includes(
          "Can't perform a React state update on an unmounted component",
        ),
    ),
  );

describe('evm-transfer autocomplete behavior', () => {
  const activeWalletAddress = '0x1111111111111111111111111111111111111111';
  const savedWalletAddress = '0x3333333333333333333333333333333333333333';

  const nativeToken = {
    formattedBalance: '1',
    shortFormattedBalance: '1',
    balance: 1000000000000000000n,
    balanceInteger: 1,
    tokenInfo: {
      name: 'Ether',
      symbol: 'ETH',
      logo: '',
      chainId: '0x1',
      backgroundColor: '#000000',
      coingeckoId: 'ethereum',
      priceUsd: 3000,
      createdAt: '',
      categories: [],
      type: EVMSmartContractType.NATIVE,
    } as EvmSmartContractInfoNative,
  };

  const baseAutocomplete = {
    categories: [
      {
        title: 'evm_wallets',
        translateTitle: true,
        values: [
          {
            value: savedWalletAddress,
            label: 'Saved contact',
            subLabel: '0x33333...33333',
            img: 'identicon://saved-contact',
          },
        ],
      },
      {
        title: 'local_accounts',
        translateTitle: true,
        values: [],
      },
    ],
  };

  const buildState = () => ({
    ...initialEmptyStateStore,
    navigation: {
      ...initialEmptyStateStore.navigation,
      stack: [
        {
          currentPage: Screen.TRANSFER_FUND_PAGE,
          params: {},
        },
      ],
    },
    chain: {
      ...initialEmptyStateStore.chain,
      type: ChainType.EVM,
      chainId: '0x1',
      name: 'Ethereum',
      logo: '',
      rpcs: [{ url: 'https://rpc.example', isDefault: true }],
      mainToken: 'ETH',
      defaultTransactionType: EvmTransactionType.EIP_1559,
    },
    evm: {
      ...initialEmptyStateStore.evm,
      accounts: [
        {
          id: 0,
          path: "m/44'/60'/0'/0/0",
          seedId: 1,
          seedNickname: 'Primary seed',
          nickname: 'Active wallet',
          wallet: { address: activeWalletAddress },
        },
      ],
      activeAccount: {
        ...initialEmptyStateStore.evm.activeAccount,
        address: activeWalletAddress,
        wallet: { address: activeWalletAddress },
        isReady: true,
        nativeAndErc20Tokens: {
          value: [nativeToken],
          loading: false,
        },
      },
    },
  });

  beforeEach(() => {
    chrome.i18n.getMessage = jest.fn((key: string) => key);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    cleanup();
  });

  it('shows base autocomplete suggestions before enrichment resolves', async () => {
    const enrichmentDeferred = createDeferred<typeof baseAutocomplete>();

    jest
      .spyOn(EvmTokensUtils, 'filterTokensBasedOnSettings')
      .mockResolvedValue([nativeToken] as any);
    jest
      .spyOn(EvmAddressesUtils, 'getWhiteListAutocomplete')
      .mockResolvedValue(baseAutocomplete);
    const enrichSpy = jest
      .spyOn(EvmAddressesUtils, 'enrichWhiteListAutocomplete')
      .mockReturnValue(enrichmentDeferred.promise);

    customRender(<EvmTransferComponent />, {
      initialState: buildState(),
    });

    const input = await screen.findByTestId('input-address');
    fireEvent.focus(input);

    expect(await screen.findByText('Saved contact')).toBeInTheDocument();
    expect(enrichSpy).toHaveBeenCalledWith(baseAutocomplete);

    await act(async () => {
      enrichmentDeferred.resolve(baseAutocomplete);
      await Promise.resolve();
    });
  });

  it('does not update local state when enrichment resolves after unmount', async () => {
    const enrichmentDeferred = createDeferred<typeof baseAutocomplete>();

    jest
      .spyOn(EvmTokensUtils, 'filterTokensBasedOnSettings')
      .mockResolvedValue([nativeToken] as any);
    jest
      .spyOn(EvmAddressesUtils, 'getWhiteListAutocomplete')
      .mockResolvedValue(baseAutocomplete);
    jest
      .spyOn(EvmAddressesUtils, 'enrichWhiteListAutocomplete')
      .mockReturnValue(enrichmentDeferred.promise);

    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { unmount } = customRender(<EvmTransferComponent />, {
      initialState: buildState(),
    });

    await waitFor(() => {
      expect(screen.getByTestId('input-address')).toBeInTheDocument();
    });

    unmount();

    await act(async () => {
      enrichmentDeferred.resolve(baseAutocomplete);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(hasUnmountedStateUpdateWarning(consoleError)).toBe(false);
  });
});
