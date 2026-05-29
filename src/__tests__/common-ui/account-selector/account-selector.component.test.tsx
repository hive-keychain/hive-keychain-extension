import '@testing-library/jest-dom';
import { act, cleanup, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { localAccounts } from 'src/__tests__/utils-for-testing/data/local-accounts';
import mkData from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';
import { AccountSelectorComponent } from 'src/common-ui/account-selector/account-selector.component';
import { EvmAccountSource } from 'src/popup/evm/interfaces/wallet.interface';
import { setAccounts } from 'src/popup/hive/actions/account.actions';
import AccountUtils from 'src/popup/hive/utils/account.utils';

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
) => ({
  ...initialEmptyStateStore,
  mk,
  hive: {
    ...initialEmptyStateStore.hive,
    accounts: hiveAccounts,
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
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    cleanup();
  });

  it('renders the active Hive account trigger', () => {
    customRender(<AccountSelectorComponent selectedAccountType="hive" />, {
      initialState: buildState(),
    });

    expect(screen.getByTestId('selected-account-name')).toHaveTextContent(
      userData.one.username,
    );
  });

  it('renders the active EVM account trigger', () => {
    customRender(<AccountSelectorComponent selectedAccountType="evm" />, {
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
    customRender(<AccountSelectorComponent selectedAccountType="hive" />, {
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
      within(
        screen.getByTestId(
          `account-selector-hive-account-${userData.one.username}`,
        ),
      ).getByTestId(/^account-selector-selected-/),
    ).toBeInTheDocument();
    expect(
      within(
        screen.getByTestId(
          `account-selector-hive-account-${userData.one.username}`,
        ),
      ).getByTestId(/^account-selector-edit-/),
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
      within(
        screen.getByTestId(
          `account-selector-hive-account-${userData.two.username}`,
        ),
      ).queryByTestId(/^account-selector-selected-/),
    ).not.toBeInTheDocument();
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
      ).getByTestId(/^account-selector-edit-/),
    ).toBeInTheDocument();
    expect(
      within(
        screen.getByTestId(`account-selector-evm-account-${firstEvmAddress}`),
      ).getByTestId(/^account-selector-copy-/),
    ).toBeInTheDocument();
    expect(
      within(
        screen.getByTestId(`account-selector-evm-account-${firstEvmAddress}`),
      ).queryByTestId(/^account-selector-selected-/),
    ).not.toBeInTheDocument();
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

  it('does not dispatch an account change when clicking a list row', async () => {
    const { store } = customRender(
      <AccountSelectorComponent selectedAccountType="hive" />,
      {
        initialState: buildState(),
      },
    );
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    await userEvent.click(screen.getByTestId('account-selector-trigger'));
    await userEvent.click(
      screen.getByTestId(
        `account-selector-hive-account-${userData.two.username}`,
      ),
    );

    expect(dispatchSpy).not.toHaveBeenCalled();
    expect(screen.getByTestId('selected-account-name')).toHaveTextContent(
      userData.one.username,
    );
  });

  it('refreshes Hive accounts when reopening the account list', async () => {
    const { store } = customRender(
      <AccountSelectorComponent selectedAccountType="evm" />,
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

    customRender(<AccountSelectorComponent selectedAccountType="evm" />, {
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
      <AccountSelectorComponent selectedAccountType="hive" />,
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
    customRender(<AccountSelectorComponent selectedAccountType="evm" />, {
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
