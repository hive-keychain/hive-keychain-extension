import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { submitHiveAccountCreationPaymentTx } from '@api/hive-account-creation';
import {
  HiveAccountCreationStatus,
  PendingHiveAccountCreationRequest,
} from '@interfaces/hive-account-creation.interface';
import { Screen } from '@interfaces/screen.interface';
import * as PaidAccountCreationActions from '@popup/hive/actions/paid-account-creation.actions';
import {
  ChainType,
  EvmChain,
  HiveChain,
} from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { ExtensionSurfaceUtils } from '@popup/multichain/utils/extension-surface.utils';
import { PaidAccountCreationRouteUtils } from '@popup/multichain/utils/paid-account-creation-route.utils';
import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmTransactionsUtils } from '@popup/evm/utils/evm-transactions.utils';
import React from 'react';
import { Provider } from 'react-redux';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import * as copyToastUtils from 'src/common-ui/toast/copy-toast.utils';
import { PendingAccountCreationPaymentComponent } from 'src/popup/hive/pages/app-container/settings/accounts/create-account/pending-account-creation-payment/pending-account-creation-payment.component';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import { PendingHiveAccountCreationUtils } from 'src/utils/pending-hive-account-creation.utils';

jest.mock('@api/hive-account-creation', () => ({
  submitHiveAccountCreationPaymentTx: jest.fn(),
}));

jest.mock('@popup/hive/actions/paid-account-creation.actions', () => {
  const actual = jest.requireActual(
    '@popup/hive/actions/paid-account-creation.actions',
  );

  return {
    ...actual,
    PaidAccountCreationActions: {
      ...actual.PaidAccountCreationActions,
      isTerminalPaidAccountCreationFailure: jest.fn((status) =>
        [
          'expired',
          'underpaid',
          'paid_after_expiry',
          'username_unavailable',
          'account_creation_failed',
          'cancelled',
        ].includes(status),
      ),
    },
    synchronizePendingHiveAccountCreation: jest.fn(
      () => async () => ({ outcome: 'skipped' }),
    ),
  };
});

jest.mock('@popup/evm/actions/active-account.actions', () => ({
  loadEvmActiveAccount: (_chain: unknown, wallet: { address: string }) => {
    const {
      EvmActionType,
    } = require('@popup/evm/actions/action-type.evm.enum');
    return (dispatch: (action: unknown) => unknown) =>
      dispatch({
        type: EvmActionType.SET_ACTIVE_ACCOUNT,
        payload: {
          address: wallet.address,
          wallet,
          nativeAndErc20Tokens: {
            initialized: true,
            loading: false,
            value: [],
          },
        },
      });
  },
}));

jest.mock('@popup/evm/utils/evm-rpc.utils', () => ({
  EvmRpcUtils: {
    getActiveRpc: jest.fn().mockResolvedValue({
      uri: 'https://test-rpc.local',
    }),
    setActiveRpc: jest.fn(),
  },
}));

jest.mock('@popup/evm/utils/evm-chain.utils', () => ({
  EvmChainUtils: {
    saveLastUsedChain: jest.fn(),
  },
}));

jest.mock('@popup/multichain/utils/extension-surface.utils', () => ({
  ExtensionSurfaceUtils: {
    isSidePanelPage: jest.fn(() => false),
  },
}));

jest.mock('@popup/multichain/utils/paid-account-creation-route.utils', () => ({
  PaidAccountCreationRouteUtils: {
    openPaymentStatusInSidePanel: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('react-qr-code', () => (props: any) => {
  const React = require('react');
  return React.createElement('div', {
    'data-testid': props['data-testid'],
    'data-value': props.value,
  });
});

jest.mock('src/common-ui/svg-icon/svg-icon.component', () => ({
  SVGIcon: () => {
    const React = require('react');
    return React.createElement('span', { 'data-testid': 'svg-icon' });
  },
}));

describe('PendingAccountCreationPaymentComponent', () => {
  const mk = 'test-master-key';
  const pendingRequest: PendingHiveAccountCreationRequest = {
    requestId: 'request-1',
    username: 'new-account',
    encryptedAccount: 'encrypted-pending-account-payload',
    paymentCurrency: 'HIVE',
    paymentAddress: 'hive-keychain',
    memo: 'account-creation:request-1',
    amount: '3.000',
    expiresAt: '2026-04-28T01:00:00.000Z',
    status: 'payment_pending',
    createdAt: '2026-04-28T00:00:00.000Z',
    updatedAt: '2026-04-28T00:00:00.000Z',
  };
  const payerAddress = '0x1111111111111111111111111111111111111111';
  const evmPendingRequest: PendingHiveAccountCreationRequest = {
    ...pendingRequest,
    paymentCurrency: 'EVM:40:native',
    paymentChainId: '40',
    paymentAddress: '0x2222222222222222222222222222222222222222',
    payerEvmAddress: payerAddress,
    paymentTokenSymbol: 'TLOS',
    paymentTokenDecimals: 18,
  };
  const paymentChain = {
    name: 'Telos EVM',
    type: ChainType.EVM,
    chainId: '40',
    logo: '',
    rpcs: [],
    mainToken: 'TLOS',
    defaultTransactionType: EvmTransactionType.EIP_1559,
  } as EvmChain;
  const payerAccount = {
    wallet: {
      address: payerAddress,
    },
  };

  beforeEach(() => {
    jest.restoreAllMocks();
    (submitHiveAccountCreationPaymentTx as jest.Mock).mockReset();
    (
      ExtensionSurfaceUtils.isSidePanelPage as jest.Mock
    ).mockReturnValue(false);
    (
      PaidAccountCreationRouteUtils.openPaymentStatusInSidePanel as jest.Mock
    ).mockClear();
    (
      PaidAccountCreationActions.synchronizePendingHiveAccountCreation as jest.Mock
    ).mockReset();
    (
      PaidAccountCreationActions.synchronizePendingHiveAccountCreation as jest.Mock
    ).mockImplementation(() => async () => ({ outcome: 'skipped' }));
    jest
      .spyOn(copyToastUtils, 'copyTextWithToast')
      .mockResolvedValue(true);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('loads the pending request by request id and displays payment details', async () => {
    jest
      .spyOn(
        PendingHiveAccountCreationUtils,
        'getPendingHiveAccountCreationRequests',
      )
      .mockResolvedValue([pendingRequest]);

    renderComponent();

    expect(await screen.findByText('@new-account')).toBeInTheDocument();
    expect(
      screen.queryByTestId('pending-account-creation-keep-open-disclaimer'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('3.000')).toBeInTheDocument();
    expect(screen.getByText('Hive')).toBeInTheDocument();
    expect(screen.getByText('HIVE')).toBeInTheDocument();
    expect(screen.getByText('hive-keychain')).toBeInTheDocument();
    expect(screen.getByText('account-creation:request-1')).toBeInTheDocument();
    expect(screen.queryByText('Payment pending')).not.toBeInTheDocument();
    expect(screen.getByText('Expiry')).toBeInTheDocument();
    expect(screen.queryByText('EVM:40:native')).not.toBeInTheDocument();
    expect(screen.queryByTestId('qrcode')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Pay with another wallet' }),
    ).not.toBeInTheDocument();
    expect(
      PendingHiveAccountCreationUtils.getPendingHiveAccountCreationRequests,
    ).toHaveBeenCalledWith(mk);
  });

  it('displays human-readable chain and token labels for EVM payments', async () => {
    jest
      .spyOn(
        PendingHiveAccountCreationUtils,
        'getPendingHiveAccountCreationRequests',
      )
      .mockResolvedValue([evmPendingRequest]);
    jest.spyOn(ChainUtils, 'getDefaultChains').mockResolvedValue([paymentChain]);
    jest.spyOn(ChainUtils, 'getCustomChains').mockResolvedValue([]);

    renderComponent({
      state: {
        evm: {
          ...initialEmptyStateStore.evm,
          accounts: [payerAccount],
        },
      },
    });

    expect(await screen.findByText('Telos EVM')).toBeInTheDocument();
    expect(screen.getByText('TLOS')).toBeInTheDocument();
    expect(screen.queryByText('EVM:40:native')).not.toBeInTheDocument();
  });

  it('copies address, memo, and amount', async () => {
    jest
      .spyOn(
        PendingHiveAccountCreationUtils,
        'getPendingHiveAccountCreationRequests',
      )
      .mockResolvedValue([pendingRequest]);

    renderComponent();

    await screen.findByText('@new-account');
    fireEvent.click(screen.getByRole('button', { name: 'Copy address' }));
    fireEvent.click(screen.getByRole('button', { name: 'Copy memo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Copy amount' }));

    expect(copyToastUtils.copyTextWithToast).toHaveBeenCalledWith(
      'hive-keychain',
    );
    expect(copyToastUtils.copyTextWithToast).toHaveBeenCalledWith(
      'account-creation:request-1',
    );
    expect(copyToastUtils.copyTextWithToast).toHaveBeenCalledWith('3.000');
  });

  it('refreshes status manually through the shared synchronization action', async () => {
    const updatedRequest = {
      ...pendingRequest,
      status: 'payment_detected' as HiveAccountCreationStatus,
      updatedAt: '2026-04-28T00:02:00.000Z',
      lastCheckedAt: '2026-04-28T00:02:00.000Z',
    };
    jest
      .spyOn(
        PendingHiveAccountCreationUtils,
        'getPendingHiveAccountCreationRequests',
      )
      .mockResolvedValue([pendingRequest]);

    renderComponent();

    await waitFor(() => {
      expect(
        PaidAccountCreationActions.synchronizePendingHiveAccountCreation,
      ).toHaveBeenCalledWith('request-1');
    });
    (
      PaidAccountCreationActions.synchronizePendingHiveAccountCreation as jest.Mock
    ).mockClear();
    (
      PaidAccountCreationActions.synchronizePendingHiveAccountCreation as jest.Mock
    ).mockImplementation(
      () => async () => ({ outcome: 'updated', request: updatedRequest }),
    );

    fireEvent.click(
      await screen.findByRole('button', { name: 'Refresh status' }),
    );

    await waitFor(() => {
      expect(
        PaidAccountCreationActions.synchronizePendingHiveAccountCreation,
      ).toHaveBeenCalledWith('request-1');
    });
    expect(await screen.findByText('Payment detected')).toBeInTheDocument();
  });

  it('polls actionable requests every ten seconds without overlapping calls', async () => {
    jest.useFakeTimers();
    let resolveSynchronization: (result: unknown) => void = () => undefined;
    const synchronizationPromise = new Promise((resolve) => {
      resolveSynchronization = resolve;
    });
    (
      PaidAccountCreationActions.synchronizePendingHiveAccountCreation as jest.Mock
    ).mockImplementation(() => async () => synchronizationPromise);
    jest
      .spyOn(
        PendingHiveAccountCreationUtils,
        'getPendingHiveAccountCreationRequests',
      )
      .mockResolvedValue([pendingRequest]);

    renderComponent();

    await act(async () => {
      await Promise.resolve();
    });
    expect(
      PaidAccountCreationActions.synchronizePendingHiveAccountCreation,
    ).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(20000);
      await Promise.resolve();
    });
    expect(
      PaidAccountCreationActions.synchronizePendingHiveAccountCreation,
    ).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveSynchronization({ outcome: 'updated', request: pendingRequest });
      await Promise.resolve();
      await Promise.resolve();
    });
    await act(async () => {
      jest.advanceTimersByTime(10000);
      await Promise.resolve();
    });
    expect(
      PaidAccountCreationActions.synchronizePendingHiveAccountCreation,
    ).toHaveBeenCalledTimes(2);

    jest.useRealTimers();
  });

  it('stops polling terminal failure statuses', async () => {
    jest.useFakeTimers();
    jest
      .spyOn(
        PendingHiveAccountCreationUtils,
        'getPendingHiveAccountCreationRequests',
      )
      .mockResolvedValue([{ ...pendingRequest, status: 'expired' }]);

    renderComponent();

    await act(async () => {
      await Promise.resolve();
    });
    (
      PaidAccountCreationActions.synchronizePendingHiveAccountCreation as jest.Mock
    ).mockClear();

    await act(async () => {
      jest.advanceTimersByTime(20000);
      await Promise.resolve();
    });

    expect(
      PaidAccountCreationActions.synchronizePendingHiveAccountCreation,
    ).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('activates an automatically imported account and navigates home', async () => {
    const importedAccount = {
      name: pendingRequest.username,
      keys: { posting: 'posting-private' },
    };
    const hiveChain = {
      name: 'Hive',
      type: ChainType.HIVE,
      chainId: 'hive-chain-id',
      logo: '',
      rpcs: [],
    } as HiveChain;
    jest
      .spyOn(
        PendingHiveAccountCreationUtils,
        'getPendingHiveAccountCreationRequests',
      )
      .mockResolvedValue([pendingRequest]);
    jest
      .spyOn(ChainUtils, 'getAllSetupChainsForType')
      .mockResolvedValue([hiveChain]);
    jest.spyOn(AccountUtils, 'getExtendedAccount').mockResolvedValue({} as any);
    jest.spyOn(AccountUtils, 'getRCMana').mockResolvedValue({} as any);
    (
      PaidAccountCreationActions.synchronizePendingHiveAccountCreation as jest.Mock
    ).mockImplementation(
      () => async () => ({ outcome: 'imported', account: importedAccount }),
    );

    const { store } = renderComponent();

    await waitFor(() => {
      expect(store.getState().navigation.stack[0]?.currentPage).toBe(
        Screen.HOME_PAGE,
      );
    });
    expect(store.getState().activeAccountType).toBe(ChainType.HIVE);
    expect(store.getState().chain).toEqual(hiveChain);
    expect(store.getState().message.key).toBe(
      'html_popup_create_account_successful',
    );
  });

  it('shows the Keychain payment action for pending EVM requests', async () => {
    jest
      .spyOn(
        PendingHiveAccountCreationUtils,
        'getPendingHiveAccountCreationRequests',
      )
      .mockResolvedValue([evmPendingRequest]);
    jest.spyOn(ChainUtils, 'getDefaultChains').mockResolvedValue([paymentChain]);
    jest.spyOn(ChainUtils, 'getCustomChains').mockResolvedValue([]);

    renderComponent({
      state: {
        evm: {
          ...initialEmptyStateStore.evm,
          accounts: [payerAccount],
        },
      },
    });

    expect(
      screen.queryByRole('button', { name: 'Pay with another wallet' }),
    ).not.toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: 'Pay with Keychain' }),
    ).toBeInTheDocument();
  });

  it('auto-opens the EVM confirmation page from side-panel route params', async () => {
    jest
      .spyOn(
        PendingHiveAccountCreationUtils,
        'getPendingHiveAccountCreationRequests',
      )
      .mockResolvedValue([evmPendingRequest]);
    jest.spyOn(ChainUtils, 'getDefaultChains').mockResolvedValue([paymentChain]);
    jest.spyOn(ChainUtils, 'getCustomChains').mockResolvedValue([]);

    const { store } = renderComponent({
      navParams: { requestId: 'request-1', autoPayWithKeychain: true },
      state: {
        evm: {
          ...initialEmptyStateStore.evm,
          accounts: [payerAccount],
        },
      },
    });

    await waitFor(() => {
      expect(store.getState().navigation.stack[0]).toMatchObject({
        currentPage: Screen.CONFIRMATION_PAGE,
        params: {
          hasGasFee: true,
          receiverAddress: evmPendingRequest.paymentAddress,
          amount: evmPendingRequest.amount,
          wallet: payerAccount.wallet,
          transactionData: expect.objectContaining({
            from: payerAddress,
            to: evmPendingRequest.paymentAddress,
          }),
        },
      });
    });
    expect(
      PaidAccountCreationActions.synchronizePendingHiveAccountCreation,
    ).not.toHaveBeenCalled();
  });

  it('returns to create account step two when cancelling the confirmation page', async () => {
    const stepOneParams = { mode: 'PAID_BACKEND_CREATION' };
    const stepTwoParams = {
      newUsername: 'new-account',
      paymentSelection: {
        paymentChainId: '40',
        paymentTokenAddress: null,
      },
    };
    jest
      .spyOn(
        PendingHiveAccountCreationUtils,
        'getPendingHiveAccountCreationRequests',
      )
      .mockResolvedValue([evmPendingRequest]);
    jest.spyOn(ChainUtils, 'getDefaultChains').mockResolvedValue([paymentChain]);
    jest.spyOn(ChainUtils, 'getCustomChains').mockResolvedValue([]);

    const { store } = renderComponent({
      navParams: { requestId: 'request-1', autoPayWithKeychain: true },
      state: {
        evm: {
          ...initialEmptyStateStore.evm,
          accounts: [payerAccount],
        },
        navigation: {
          params: { requestId: 'request-1', autoPayWithKeychain: true },
          stack: [
            {
              currentPage: Screen.PENDING_ACCOUNT_CREATION_PAYMENT,
              params: { requestId: 'request-1', autoPayWithKeychain: true },
            },
            {
              currentPage: Screen.CREATE_ACCOUNT_PAGE_STEP_TWO,
              params: stepTwoParams,
            },
            {
              currentPage: Screen.CREATE_ACCOUNT_PAGE_STEP_ONE,
              params: stepOneParams,
            },
          ],
        },
      },
    });

    await waitFor(() => {
      expect(store.getState().navigation.stack[0]?.currentPage).toBe(
        Screen.CONFIRMATION_PAGE,
      );
    });

    const confirmationParams = store.getState().navigation.stack[0].params as any;
    await act(async () => {
      expect(await confirmationParams.afterCancelAction()).toBe(true);
    });

    expect(store.getState().navigation.stack).toEqual([
      expect.objectContaining({
        currentPage: Screen.CREATE_ACCOUNT_PAGE_STEP_TWO,
        params: stepTwoParams,
      }),
      expect.objectContaining({
        currentPage: Screen.CREATE_ACCOUNT_PAGE_STEP_ONE,
        params: stepOneParams,
      }),
    ]);
    expect(store.getState().loading.loadingOperations).toEqual([]);
  });

  it('opens the side-panel status route after confirming the Keychain transfer', async () => {
    const txHash = '0x' + 'a'.repeat(64);
    jest
      .spyOn(
        PendingHiveAccountCreationUtils,
        'getPendingHiveAccountCreationRequests',
      )
      .mockResolvedValue([evmPendingRequest]);
    jest
      .spyOn(
        PendingHiveAccountCreationUtils,
        'updatePendingHiveAccountCreationStatus',
      )
      .mockResolvedValue({
        ...evmPendingRequest,
        status: 'payment_detected',
        paymentTxHash: txHash,
      });
    jest.spyOn(ChainUtils, 'getDefaultChains').mockResolvedValue([paymentChain]);
    jest.spyOn(ChainUtils, 'getCustomChains').mockResolvedValue([]);
    jest
      .spyOn(EvmTransactionsUtils, 'send')
      .mockResolvedValue({ hash: txHash } as any);
    (submitHiveAccountCreationPaymentTx as jest.Mock).mockResolvedValue({
      status: 'payment_detected',
    });

    const { store } = renderComponent({
      navParams: { requestId: 'request-1', autoPayWithKeychain: true },
      state: {
        chain: { name: 'Hive', type: ChainType.HIVE, chainId: 'hive' },
        evm: {
          ...initialEmptyStateStore.evm,
          accounts: [payerAccount],
        },
      },
    });

    await waitFor(() => {
      expect(store.getState().navigation.stack[0]?.currentPage).toBe(
        Screen.CONFIRMATION_PAGE,
      );
    });

    const confirmationParams = store.getState().navigation.stack[0].params as any;
    await act(async () => {
      await confirmationParams.afterConfirmAction({} as any);
    });

    expect(EvmTransactionsUtils.send).not.toHaveBeenCalled();
    expect(submitHiveAccountCreationPaymentTx).not.toHaveBeenCalled();
    expect(
      PendingHiveAccountCreationUtils.updatePendingHiveAccountCreationStatus,
    ).toHaveBeenCalledWith(
      'request-1',
      'payment_detected',
      mk,
      `0x${'0'.repeat(64)}`,
    );
    expect(
      PaidAccountCreationRouteUtils.openPaymentStatusInSidePanel,
    ).toHaveBeenCalledWith('request-1');
  });

  it('hides external wallet payment actions after payment is no longer pending', async () => {
    jest
      .spyOn(
        PendingHiveAccountCreationUtils,
        'getPendingHiveAccountCreationRequests',
      )
      .mockResolvedValue([
        {
          ...pendingRequest,
          status: 'payment_detected' as HiveAccountCreationStatus,
        },
      ]);

    renderComponent();

    expect(await screen.findByText('Payment detected')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Pay with another wallet' }),
    ).not.toBeInTheDocument();
  });

  it.each([
    ['payment_detected', 'Payment detected'],
    ['payment_confirming', 'Payment confirming'],
    ['creating_account', 'Creating account'],
  ] as [HiveAccountCreationStatus, string][])(
    'shows keep-open disclaimer for in-progress %s status',
    async (status) => {
      jest
        .spyOn(
          PendingHiveAccountCreationUtils,
          'getPendingHiveAccountCreationRequests',
        )
        .mockResolvedValue([{ ...pendingRequest, status }]);

      renderComponent();

      expect(
        await screen.findByTestId(
          'pending-account-creation-keep-open-disclaimer',
        ),
      ).toBeInTheDocument();
    },
  );

  it('shows keep-open disclaimer for payment_pending after broadcast', async () => {
    jest
      .spyOn(
        PendingHiveAccountCreationUtils,
        'getPendingHiveAccountCreationRequests',
      )
      .mockResolvedValue([
        {
          ...pendingRequest,
          paymentTxHash: 'a'.repeat(40),
        },
      ]);

    renderComponent();

    expect(
      await screen.findByTestId(
        'pending-account-creation-keep-open-disclaimer',
      ),
    ).toBeInTheDocument();
    expect(await screen.findByText('Payment pending')).toBeInTheDocument();
  });

  it.each([
    ['expired', 'Expired'],
    ['underpaid', 'Underpaid'],
    ['paid_after_expiry', 'Paid after expiry'],
    ['username_unavailable', 'Username unavailable'],
    ['account_creation_failed', 'Account creation failed'],
    ['cancelled', 'Cancelled'],
  ] as [HiveAccountCreationStatus, string][])(
    'hides keep-open disclaimer for terminal %s status',
    async (status, label) => {
      jest
        .spyOn(
          PendingHiveAccountCreationUtils,
          'getPendingHiveAccountCreationRequests',
        )
        .mockResolvedValue([{ ...pendingRequest, status }]);

      renderComponent();

      expect(
        await screen.findByTestId('pending-account-creation-status'),
      ).toBeInTheDocument();
      expect(await screen.findByText(label)).toBeInTheDocument();
      expect(screen.queryByText('Status')).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('pending-account-creation-keep-open-disclaimer'),
      ).not.toBeInTheDocument();
    },
  );

  it.each([
    ['payment_detected', 'Payment detected'],
    ['payment_confirming', 'Payment confirming'],
    ['expired', 'Expired'],
    ['underpaid', 'Underpaid'],
    ['overpaid', 'Overpaid'],
    ['paid_after_expiry', 'Paid after expiry'],
    ['username_unavailable', 'Username unavailable'],
    ['account_creation_failed', 'Account creation failed'],
  ] as [HiveAccountCreationStatus, string][])(
    'renders %s status',
    async (status, label) => {
      jest
        .spyOn(
          PendingHiveAccountCreationUtils,
          'getPendingHiveAccountCreationRequests',
        )
        .mockResolvedValue([{ ...pendingRequest, status }]);

      renderComponent();

      expect(await screen.findByText(label)).toBeInTheDocument();
    },
  );

  const renderComponent = ({
    navParams = { requestId: 'request-1' },
    state = {},
  }: {
    navParams?: Record<string, unknown>;
    state?: Record<string, unknown>;
  } = {}) => {
    const store = getFakeStore({
      ...initialEmptyStateStore,
      ...state,
      mk,
      navigation: state.navigation ?? {
        params: navParams,
        stack: [
          {
            currentPage: Screen.PENDING_ACCOUNT_CREATION_PAYMENT,
            params: navParams,
          },
        ],
      },
    } as any);
    return {
      ...render(
        <Provider store={store}>
          <PendingAccountCreationPaymentComponent />
        </Provider>,
      ),
      store,
    };
  };
});
