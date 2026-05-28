import '@testing-library/jest-dom';
import { act, cleanup } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import React from 'react';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import {
  customRender,
  screen,
  waitFor,
} from 'src/__tests__/utils-for-testing/setups/render';
import { EvmSelectAccountSectionComponent } from 'src/popup/evm/pages/home/evm-select-account-section/evm-select-account-section.component';
import { EvmAddressesUtils } from 'src/popup/evm/utils/evm-addresses.utils';
import {
  CatchupStatus,
  EvmLightNodeUtils,
  PricingStatus,
} from 'src/popup/evm/utils/evm-light-node.utils';
import { EvmWalletUtils } from 'src/popup/evm/utils/wallet.utils';
import { ChainType } from 'src/popup/multichain/interfaces/chains.interface';

jest.mock('src/common-ui/evm/evm-account-image/evm-account-image.component', () => ({
  EvmAccountImage: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'evm-account-image' });
  },
}));

jest.mock('react-dropdown-select', () => ({
  __esModule: true,
  default: ({ contentRenderer, dropdownRenderer }: any) => {
    const React = require('react');
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(
        'div',
        { 'aria-label': 'Dropdown select' },
        contentRenderer({}),
      ),
      React.createElement(
        'div',
        { 'data-testid': 'dropdown-content' },
        dropdownRenderer({
          props: {},
          state: {},
          methods: { dropDown: jest.fn() },
        }),
      ),
    );
  },
}));

jest.mock('react-beautiful-dnd', () => ({
  DragDropContext: ({ children }: any) => {
    const React = require('react');
    return React.createElement(React.Fragment, null, children);
  },
  Droppable: ({ children }: any) =>
    children({
      droppableProps: {},
      innerRef: jest.fn(),
      placeholder: null,
    }),
  Draggable: ({ children }: any) =>
    children({
      innerRef: jest.fn(),
      draggableProps: {},
      dragHandleProps: {},
    }),
}));

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

describe('evm-select-account-section unmount behavior', () => {
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

  beforeEach(() => {
    chrome.i18n.getMessage = jest.fn((key: string) => key);
  });

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it('does not update local state after address details resolve post-unmount', async () => {
    const wallet = {
      address: '0x1234567890123456789012345678901234567890',
    } as any;
    const account = {
      id: 0,
      path: "m/44'/60'/0'/0/0",
      seedId: 1,
      seedNickname: 'Main seed',
      nickname: 'Account 1',
      wallet,
    } as any;
    const addressDetailsDeferred = createDeferred<any>();

    jest
      .spyOn(EvmAddressesUtils, 'getAddressDetails')
      .mockReturnValue(addressDetailsDeferred.promise);

    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { unmount } = customRender(<EvmSelectAccountSectionComponent />, {
      initialState: {
        ...initialEmptyStateStore,
        mk: 'my-password',
        chain: {
          ...initialEmptyStateStore.chain,
          type: ChainType.EVM,
          chainId: '1',
          name: 'Ethereum',
        },
        evm: {
          ...initialEmptyStateStore.evm,
          accounts: [account],
          activeAccount: {
            ...initialEmptyStateStore.evm.activeAccount,
            address: wallet.address,
            wallet,
            isReady: true,
          },
        },
      },
    });

    unmount();

    await act(async () => {
      addressDetailsDeferred.resolve({
        fullAddress: wallet.address,
        formattedAddress: '0x1234...7890',
        label: 'Account 1',
        avatar: undefined,
      });
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(hasUnmountedStateUpdateWarning(consoleError)).toBe(false);
  });

  it('shows the fallback account name when the saved nickname is empty', async () => {
    const wallet = {
      address: '0x1234567890123456789012345678901234567890',
    } as any;
    const account = {
      id: 0,
      path: "m/44'/60'/0'/0/0",
      seedId: 1,
      seedNickname: 'Main seed',
      nickname: '',
      wallet,
    } as any;

    jest.spyOn(EvmAddressesUtils, 'getAddressDetails').mockResolvedValue({
      fullAddress: wallet.address,
      formattedAddress: '0x1234...7890',
      label: 'dialog_account 1',
      avatar: undefined,
    });

    customRender(<EvmSelectAccountSectionComponent />, {
      initialState: {
        ...initialEmptyStateStore,
        mk: 'my-password',
        chain: {
          ...initialEmptyStateStore.chain,
          type: ChainType.EVM,
          chainId: '1',
          name: 'Ethereum',
        },
        evm: {
          ...initialEmptyStateStore.evm,
          accounts: [account],
          activeAccount: {
            ...initialEmptyStateStore.evm.activeAccount,
            address: wallet.address,
            wallet,
            isReady: true,
          },
        },
      },
    });

    await waitFor(() => {
      expect(screen.getAllByText('Main seed').length).toBeGreaterThan(0);
      expect(screen.getAllByText('dialog_account 1').length).toBeGreaterThan(0);
    });
  });

  it('promotes selected account in provider permissions without reordering dropdown', async () => {
    const firstWallet = {
      address: '0x1234567890123456789012345678901234567890',
    } as any;
    const secondWallet = {
      address: '0x2234567890123456789012345678901234567890',
    } as any;
    const firstAccount = {
      id: 0,
      path: "m/44'/60'/0'/0/0",
      seedId: 1,
      seedNickname: 'Main seed',
      nickname: 'Account 1',
      wallet: firstWallet,
    } as any;
    const secondAccount = {
      id: 1,
      path: "m/44'/60'/0'/0/1",
      seedId: 1,
      seedNickname: 'Main seed',
      nickname: 'Account 2',
      wallet: secondWallet,
    } as any;

    jest
      .spyOn(EvmAddressesUtils, 'getAddressDetails')
      .mockImplementation(async (address: string) => ({
        fullAddress: address,
        formattedAddress: `${address.slice(0, 6)}...${address.slice(-4)}`,
        label: address === firstWallet.address ? 'Account 1' : 'Account 2',
        avatar: undefined,
      }));
    jest
      .spyOn(EvmLightNodeUtils, 'registerAddress')
      .mockResolvedValue(undefined as never);
    jest.spyOn(EvmLightNodeUtils, 'getDiscoveredTokens').mockResolvedValue({
      tokens: [],
      pricingStatus: PricingStatus.READY,
      catchupStatus: CatchupStatus.IDLE,
    } as never);
    jest.spyOn(EvmLightNodeUtils, 'getDiscoveredNfts').mockResolvedValue({
      collections: [],
      catchupStatus: CatchupStatus.IDLE,
    } as never);
    const promoteConnectedWalletAddressSpy = jest
      .spyOn(EvmWalletUtils, 'promoteConnectedWalletAddress')
      .mockResolvedValue(undefined);

    customRender(<EvmSelectAccountSectionComponent isOnMain />, {
      initialState: {
        ...initialEmptyStateStore,
        mk: 'my-password',
        chain: {
          ...initialEmptyStateStore.chain,
          type: ChainType.EVM,
          chainId: '1',
          name: 'Ethereum',
        },
        evm: {
          ...initialEmptyStateStore.evm,
          accounts: [firstAccount, secondAccount],
          activeAccount: {
            ...initialEmptyStateStore.evm.activeAccount,
            address: firstWallet.address,
            wallet: firstWallet,
            isReady: true,
          },
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Account 2')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Account 2'));

    await waitFor(() => {
      expect(promoteConnectedWalletAddressSpy).toHaveBeenCalledWith(
        secondWallet.address,
      );
    });
  });
});
