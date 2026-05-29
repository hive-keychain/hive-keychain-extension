import '@testing-library/jest-dom';
import { act, cleanup, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import {
  ChainType,
  EvmChain,
  HiveChain,
} from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { localAccounts } from 'src/__tests__/utils-for-testing/data/local-accounts';
import mkData from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';
import { AccountSelectorComponent } from 'src/common-ui/account-selector/account-selector.component';
import { EvmAccountSource } from 'src/popup/evm/interfaces/wallet.interface';
import { setAccounts } from 'src/popup/hive/actions/account.actions';
import AccountUtils from 'src/popup/hive/utils/account.utils';

const mockCopyTextWithToast = jest.fn().mockResolvedValue(true);

jest.mock('src/common-ui/toast/copy-toast.utils', () => ({
  COPY_GENERIC_MESSAGE_KEY: 'swap_copied_to_clipboard',
  copyTextWithToast: (...args: unknown[]) => mockCopyTextWithToast(...args),
}));

jest.mock(
  'src/common-ui/evm/evm-account-image/evm-account-image.component',
  () => ({
    EvmAccountImage: ({ address }: { address: string }) => {
      const React = require('react');
      return React.createElement('div', {
        'data-testid': `evm-account-image-${address}`,
      });
    },
  }),
);

const mockLoadEvmActiveAccount = jest.fn();

jest.mock('@popup/evm/utils/evm-rpc.utils', () => ({
  EvmRpcUtils: {
    setActiveRpc: jest.fn().mockResolvedValue(undefined),
    getActiveRpc: jest.fn().mockResolvedValue({ url: 'http://localhost:8545' }),
  },
}));

jest.mock('@popup/evm/actions/active-account.actions', () => {
  const actual = jest.requireActual(
    '@popup/evm/actions/active-account.actions',
  );
  return {
    ...actual,
    loadEvmActiveAccount: jest.fn((chain: unknown, wallet: unknown) => {
      mockLoadEvmActiveAccount(chain, wallet);
      return () => async () => {};
    }),
  };
});

jest.mock('react-beautiful-dnd', () => ({
  DragDropContext: ({ children, onDragEnd }: any) => {
    const React = require('react');
    return React.createElement(
      React.Fragment,
      null,
      children,
      React.createElement('button', {
        'data-testid': 'account-selector-mock-drag-last-to-first',
        onClick: () =>
          onDragEnd({
            destination: { index: 0 },
            source: { index: 3 },
          }),
        type: 'button',
      }),
    );
  },
  Droppable: ({ children }: any) =>
    children({
      droppableProps: {},
      innerRef: jest.fn(),
      placeholder: null,
    }),
  Draggable: ({ children }: any) =>
    children({
      dragHandleProps: {},
      draggableProps: {},
      innerRef: jest.fn(),
    }),
}));

const hiveChain = {
  name: 'HIVE',
  type: ChainType.HIVE,
  chainId:
    'beeab0de00000000000000000000000000000000000000000000000000000000',
  logo: '',
  rpcs: [],
} as HiveChain;

const evmChain = {
  name: 'Ethereum',
  type: ChainType.EVM,
  chainId: '0x1',
  logo: 'https://example.com/eth.png',
  rpcs: [],
  mainToken: 'ETH',
} as EvmChain;

const polygonChain = {
  name: 'Polygon',
  type: ChainType.EVM,
  chainId: '0x89',
  logo: 'https://example.com/polygon.png',
  rpcs: [],
  mainToken: 'MATIC',
} as EvmChain;

const evmTestnetChain = {
  name: 'Sepolia',
  type: ChainType.EVM,
  chainId: '0xaa36a7',
  logo: 'https://example.com/sepolia.png',
  testnet: true,
  rpcs: [],
  mainToken: 'ETH',
} as EvmChain;

const additionalEvmChains = [
  {
    name: 'Arbitrum',
    type: ChainType.EVM,
    chainId: '0xa4b1',
    logo: 'https://example.com/arbitrum.png',
    rpcs: [],
    mainToken: 'ETH',
  },
  {
    name: 'Optimism',
    type: ChainType.EVM,
    chainId: '0xa',
    logo: 'https://example.com/optimism.png',
    rpcs: [],
    mainToken: 'ETH',
  },
  {
    name: 'Base',
    type: ChainType.EVM,
    chainId: '0x2105',
    logo: 'https://example.com/base.png',
    rpcs: [],
    mainToken: 'ETH',
  },
  {
    name: 'Gnosis',
    type: ChainType.EVM,
    chainId: '0x64',
    logo: 'https://example.com/gnosis.png',
    rpcs: [],
    mainToken: 'XDAI',
  },
] as EvmChain[];

const firstEvmAddress = '0x1234567890123456789012345678901234567890';
const secondEvmAddress = '0x2234567890123456789012345678901234567890';
const hiddenEvmAddress = '0x3234567890123456789012345678901234567890';

const createEvmAccount = (
  address: string,
  id: number,
  nickname?: string,
  hide?: boolean,
) => ({
  id,
  path: `m/44'/60'/0'/0/${id}`,
  seedId: 1,
  seedNickname: 'Main seed',
  nickname,
  wallet: { address },
  source: EvmAccountSource.SEED,
  hide,
});

const buildState = (
  hiveAccounts = [localAccounts.user1, localAccounts.user2],
  mk = mkData.user.one,
  chain: HiveChain | EvmChain = hiveChain,
) => ({
  ...initialEmptyStateStore,
  mk,
  chain,
  hive: {
    ...initialEmptyStateStore.hive,
    accounts: hiveAccounts,
    activeRpc: {
      uri: 'https://api.hive.blog',
      testnet: false,
    },
    activeAccount: {
      ...initialEmptyStateStore.hive.activeAccount,
      name: userData.one.username,
      account: {
        name: userData.one.username,
      },
    },
  },
  evm: {
    ...initialEmptyStateStore.evm,
    accounts: [
      createEvmAccount(firstEvmAddress, 0, 'Primary EVM'),
      createEvmAccount(secondEvmAddress, 1, 'Secondary EVM'),
      createEvmAccount(hiddenEvmAddress, 2, 'Hidden EVM', true),
    ],
    activeAccount: {
      ...initialEmptyStateStore.evm.activeAccount,
      address: firstEvmAddress,
      wallet: { address: firstEvmAddress },
      isReady: true,
    },
  },
});

const getAccountSelectorRowTestIds = () =>
  within(screen.getByTestId('account-selector-list'))
    .getAllByTestId(/^account-selector-(hive|evm)-account-/)
    .map((element) => element.getAttribute('data-testid'));

describe('AccountSelectorComponent', () => {
  beforeEach(() => {
    chrome.i18n.getMessage = jest.fn((key: string) => key);
    mockCopyTextWithToast.mockClear();
    jest
      .spyOn(ChainUtils, 'getAllSetupChainsForType')
      .mockImplementation(async (type) => {
        if (type === ChainType.HIVE) {
          return [hiveChain];
        }
        if (type === ChainType.EVM) {
          return [evmChain, polygonChain, evmTestnetChain, ...additionalEvmChains];
        }
        return [];
      });
    jest.spyOn(ChainUtils, 'getSetupChains').mockResolvedValue([hiveChain]);
    jest.spyOn(EvmChainUtils, 'getLastEvmChain').mockResolvedValue(evmChain);
    jest.spyOn(EvmChainUtils, 'getEthChain').mockResolvedValue(evmChain);
    AccountUtils.getExtendedAccount = jest
      .fn()
      .mockImplementation(async (name: string) => ({ name }));
    AccountUtils.getRCMana = jest.fn().mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    cleanup();
  });

  it('renders the active Hive account trigger', () => {
    customRender(<AccountSelectorComponent selectedAccountType={ChainType.HIVE} />, {
      initialState: buildState(),
    });

    expect(screen.getByTestId('selected-account-name')).toHaveTextContent(
      userData.one.username,
    );
    expect(
      screen.getByTestId('account-selector-dropdown-handle'),
    ).toBeInTheDocument();
  });

  it('renders the active EVM account trigger', () => {
    customRender(<AccountSelectorComponent selectedAccountType={ChainType.EVM} />, {
      initialState: buildState(),
    });

    expect(screen.getByTestId('selected-account-name')).toHaveTextContent(
      'Main seed',
    );
    expect(screen.getByTestId('selected-account-name')).toHaveTextContent(
      'Primary EVM',
    );
    expect(screen.getByTestId('selected-account-name')).toHaveTextContent(
      '0x1234...7890',
    );
  });

  it('opens the bottom sheet and lists Hive names and formatted visible EVM accounts', async () => {
    customRender(<AccountSelectorComponent selectedAccountType={ChainType.HIVE} />, {
      initialState: buildState(),
    });

    await userEvent.click(screen.getByTestId('account-selector-trigger'));

    expect(screen.getByTestId('account-selector-title')).toHaveTextContent(
      'popup_html_accounts',
    );
    expect(
      screen.getByTestId(
        `account-selector-hive-account-${userData.one.username}`,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(
        `account-selector-hive-account-${userData.one.username}`,
      ),
    ).toHaveClass('account-selector-list-item--selected');
    expect(
      within(
        screen.getByTestId(
          `account-selector-hive-account-${userData.one.username}`,
        ),
      ).getByTestId(/^account-selector-manage-/),
    ).toBeInTheDocument();
    expect(
      within(
        screen.getByTestId(
          `account-selector-hive-account-${userData.one.username}`,
        ),
      ).getByTestId(/^account-selector-copy-/),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(
        `account-selector-hive-account-${userData.two.username}`,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(
        `account-selector-hive-account-${userData.two.username}`,
      ),
    ).not.toHaveClass('account-selector-list-item--selected');
    expect(
      screen.getByTestId(`account-selector-evm-account-${firstEvmAddress}`),
    ).toHaveTextContent('Main seed');
    expect(
      screen.getByTestId(`account-selector-evm-account-${firstEvmAddress}`),
    ).toHaveTextContent('Primary EVM');
    expect(
      screen.getByTestId(`account-selector-evm-account-${firstEvmAddress}`),
    ).toHaveTextContent('0x1234...7890');
    expect(
      within(
        screen.getByTestId(`account-selector-evm-account-${firstEvmAddress}`),
      ).getByTestId(/^account-selector-manage-/),
    ).toBeInTheDocument();
    expect(
      within(
        screen.getByTestId(`account-selector-evm-account-${firstEvmAddress}`),
      ).getByTestId(/^account-selector-copy-/),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`account-selector-evm-account-${firstEvmAddress}`),
    ).not.toHaveClass('account-selector-list-item--selected');
    expect(
      screen.getByTestId(`account-selector-evm-account-${secondEvmAddress}`),
    ).toHaveTextContent('Main seed');
    expect(
      screen.getByTestId(`account-selector-evm-account-${secondEvmAddress}`),
    ).toHaveTextContent('Secondary EVM');
    expect(
      screen.getByTestId(`account-selector-evm-account-${secondEvmAddress}`),
    ).toHaveTextContent('0x2234...7890');
    expect(screen.queryByText(hiddenEvmAddress)).not.toBeInTheDocument();
    expect(screen.getByTestId('account-selector-create-evm')).toHaveTextContent(
      'evm_addresses_add',
    );
    expect(screen.getByTestId('account-selector-create-hive')).toHaveTextContent(
      'evm_addresses_add',
    );
  });

  it('shows Hive icon on Hive rows and stacked mainnet EVM chain logos on EVM rows', async () => {
    customRender(<AccountSelectorComponent selectedAccountType={ChainType.HIVE} />, {
      initialState: buildState(),
    });

    await userEvent.click(screen.getByTestId('account-selector-trigger'));

    expect(
      within(
        screen.getByTestId(
          `account-selector-hive-account-${userData.one.username}`,
        ),
      ).getByTestId('account-selector-hive-chain-indicator'),
    ).toBeInTheDocument();

    const evmAccountRow = screen.getByTestId(
      `account-selector-evm-account-${firstEvmAddress}`,
    );
    expect(
      within(evmAccountRow).getByTestId('account-selector-evm-chains-indicator'),
    ).toBeInTheDocument();
    expect(
      within(evmAccountRow).getByTestId('account-selector-evm-chain-0x1'),
    ).toBeInTheDocument();
    expect(
      within(evmAccountRow).getByTestId('account-selector-evm-chain-0x89'),
    ).toBeInTheDocument();
    expect(
      within(evmAccountRow).queryByTestId('account-selector-evm-chain-0xaa36a7'),
    ).not.toBeInTheDocument();
  });

  it('shows at most five EVM chain logos when more chains are active', async () => {
    customRender(<AccountSelectorComponent selectedAccountType={ChainType.HIVE} />, {
      initialState: buildState(),
    });

    await userEvent.click(screen.getByTestId('account-selector-trigger'));

    const evmAccountRow = screen.getByTestId(
      `account-selector-evm-account-${firstEvmAddress}`,
    );
    const chainsIndicator = within(evmAccountRow).getByTestId(
      'account-selector-evm-chains-indicator',
    );

    expect(
      within(chainsIndicator).getAllByTestId(/^account-selector-evm-chain-/),
    ).toHaveLength(5);
    expect(
      within(chainsIndicator).queryByTestId('account-selector-evm-chain-0x64'),
    ).not.toBeInTheDocument();
  });

  it('copies the Hive username when clicking the copy icon', async () => {
    customRender(<AccountSelectorComponent selectedAccountType={ChainType.HIVE} />, {
      initialState: buildState(),
    });

    await userEvent.click(screen.getByTestId('account-selector-trigger'));
    await userEvent.click(
      within(
        screen.getByTestId(
          `account-selector-hive-account-${userData.two.username}`,
        ),
      ).getByTestId(/^account-selector-copy-/),
    );

    expect(mockCopyTextWithToast).toHaveBeenCalledWith(
      userData.two.username,
      'swap_copied_to_clipboard',
    );
    expect(screen.getByTestId('account-selector-backdrop')).toBeInTheDocument();
  });

  it('copies the EVM address when clicking the copy icon', async () => {
    customRender(<AccountSelectorComponent selectedAccountType={ChainType.EVM} />, {
      initialState: buildState(),
    });

    await userEvent.click(screen.getByTestId('account-selector-trigger'));
    await userEvent.click(
      within(
        screen.getByTestId(`account-selector-evm-account-${secondEvmAddress}`),
      ).getByTestId(/^account-selector-copy-/),
    );

    expect(mockCopyTextWithToast).toHaveBeenCalledWith(
      secondEvmAddress,
      'swap_copied_to_clipboard',
    );
    expect(screen.getByTestId('account-selector-backdrop')).toBeInTheDocument();
  });

  it('switches the active Hive account when clicking another Hive account on Hive chain', async () => {
    const { store } = customRender(
      <AccountSelectorComponent selectedAccountType={ChainType.HIVE} />,
      {
        initialState: buildState(),
      },
    );

    await userEvent.click(screen.getByTestId('account-selector-trigger'));
    await userEvent.click(
      screen.getByTestId(
        `account-selector-hive-account-${userData.two.username}`,
      ),
    );

    await waitFor(() => {
      expect(store.getState().hive.activeAccount.name).toBe(
        userData.two.username,
      );
    });
    expect(store.getState().chain.chainId).toBe(hiveChain.chainId);
    expect(
      screen.queryByTestId('account-selector-backdrop'),
    ).not.toBeInTheDocument();
  });

  it('switches chain and EVM account when clicking an EVM account from Hive chain', async () => {
    mockLoadEvmActiveAccount.mockClear();
    const { store } = customRender(
      <AccountSelectorComponent selectedAccountType={ChainType.HIVE} />,
      {
        initialState: buildState(),
      },
    );

    await userEvent.click(screen.getByTestId('account-selector-trigger'));
    await userEvent.click(
      screen.getByTestId(`account-selector-evm-account-${secondEvmAddress}`),
    );

    await waitFor(() => {
      expect(store.getState().chain.type).toBe(ChainType.EVM);
    });
    expect(mockLoadEvmActiveAccount).toHaveBeenCalledWith(
      evmChain,
      expect.objectContaining({
        address: secondEvmAddress,
      }),
    );
    expect(
      screen.queryByTestId('account-selector-backdrop'),
    ).not.toBeInTheDocument();
  });

  it('closes the overlay without changing account when clicking the already selected account', async () => {
    mockLoadEvmActiveAccount.mockClear();
    const { store } = customRender(
      <AccountSelectorComponent selectedAccountType={ChainType.HIVE} />,
      {
        initialState: buildState(),
      },
    );

    await userEvent.click(screen.getByTestId('account-selector-trigger'));
    await userEvent.click(
      screen.getByTestId(
        `account-selector-hive-account-${userData.one.username}`,
      ),
    );

    expect(store.getState().hive.activeAccount.name).toBe(userData.one.username);
    expect(mockLoadEvmActiveAccount).not.toHaveBeenCalled();
    expect(
      screen.queryByTestId('account-selector-backdrop'),
    ).not.toBeInTheDocument();
  });

  it('refreshes Hive accounts when reopening the account list', async () => {
    const { store } = customRender(
      <AccountSelectorComponent selectedAccountType={ChainType.EVM} />,
      {
        initialState: buildState([], mkData.empty),
      },
    );

    await userEvent.click(screen.getByTestId('account-selector-trigger'));
    expect(
      screen.queryByTestId(
        `account-selector-hive-account-${userData.one.username}`,
      ),
    ).not.toBeInTheDocument();

    await userEvent.click(screen.getByTestId('account-selector-backdrop'));

    act(() => {
      store.dispatch(
        setAccounts([localAccounts.user1, localAccounts.user2]) as any,
      );
    });

    await userEvent.click(screen.getByTestId('account-selector-trigger'));

    expect(
      screen.getByTestId(
        `account-selector-hive-account-${userData.one.username}`,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(
        `account-selector-hive-account-${userData.two.username}`,
      ),
    ).toBeInTheDocument();
  });

  it('loads Hive accounts from storage when opening the account list without Hive accounts in state', async () => {
    const getAccountsFromLocalStorageSpy = jest
      .spyOn(AccountUtils, 'getAccountsFromLocalStorage')
      .mockResolvedValue([localAccounts.user1, localAccounts.user2]);

    customRender(<AccountSelectorComponent selectedAccountType={ChainType.EVM} />, {
      initialState: buildState([]),
    });

    await userEvent.click(screen.getByTestId('account-selector-trigger'));

    expect(
      await screen.findByTestId(
        `account-selector-hive-account-${userData.one.username}`,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(
        `account-selector-hive-account-${userData.two.username}`,
      ),
    ).toBeInTheDocument();
    expect(getAccountsFromLocalStorageSpy).toHaveBeenCalledWith(
      mkData.user.one,
    );
  });

  it('reorders the account list locally after drag and drop', async () => {
    const { store } = customRender(
      <AccountSelectorComponent selectedAccountType={ChainType.HIVE} />,
      {
        initialState: buildState(),
      },
    );
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    await userEvent.click(screen.getByTestId('account-selector-trigger'));

    expect(getAccountSelectorRowTestIds()).toEqual([
      `account-selector-hive-account-${userData.one.username}`,
      `account-selector-hive-account-${userData.two.username}`,
      `account-selector-evm-account-${firstEvmAddress}`,
      `account-selector-evm-account-${secondEvmAddress}`,
    ]);

    await userEvent.click(
      screen.getByTestId('account-selector-mock-drag-last-to-first'),
    );

    expect(getAccountSelectorRowTestIds()).toEqual([
      `account-selector-evm-account-${secondEvmAddress}`,
      `account-selector-hive-account-${userData.one.username}`,
      `account-selector-hive-account-${userData.two.username}`,
      `account-selector-evm-account-${firstEvmAddress}`,
    ]);
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('closes the bottom sheet when clicking the backdrop', async () => {
    customRender(<AccountSelectorComponent selectedAccountType={ChainType.EVM} />, {
      initialState: buildState(),
    });

    await userEvent.click(screen.getByTestId('account-selector-trigger'));
    expect(screen.getByTestId('account-selector-backdrop')).toBeInTheDocument();

    await userEvent.click(screen.getByTestId('account-selector-backdrop'));

    expect(
      screen.queryByTestId('account-selector-backdrop'),
    ).not.toBeInTheDocument();
  });
});
