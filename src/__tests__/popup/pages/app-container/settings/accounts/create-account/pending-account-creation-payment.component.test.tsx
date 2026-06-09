import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  HiveAccountCreationStatus,
  PendingHiveAccountCreationRequest,
} from '@interfaces/hive-account-creation.interface';
import { Screen } from '@interfaces/screen.interface';
import * as PaidAccountCreationActions from '@popup/hive/actions/paid-account-creation.actions';
import {
  ChainType,
  HiveChain,
} from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import React from 'react';
import { Provider } from 'react-redux';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import * as copyToastUtils from 'src/common-ui/toast/copy-toast.utils';
import { PendingAccountCreationPaymentComponent } from 'src/popup/hive/pages/app-container/settings/accounts/create-account/pending-account-creation-payment/pending-account-creation-payment.component';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import { PendingHiveAccountCreationUtils } from 'src/utils/pending-hive-account-creation.utils';

jest.mock('@popup/hive/actions/paid-account-creation.actions', () => ({
  PaidAccountCreationActions: {
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

  beforeEach(() => {
    jest.restoreAllMocks();
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
      screen.getByTestId('pending-account-creation-keep-open-disclaimer'),
    ).toHaveTextContent(
      'Please keep Keychain open until your account is created. This process may take a few minutes.',
    );
    expect(screen.getByText('request-1')).toBeInTheDocument();
    expect(screen.getByText('3.000')).toBeInTheDocument();
    expect(screen.getByText('HIVE')).toBeInTheDocument();
    expect(screen.getByText('hive-keychain')).toBeInTheDocument();
    expect(screen.getByText('account-creation:request-1')).toBeInTheDocument();
    expect(screen.getByText('Payment pending')).toBeInTheDocument();
    expect(screen.getByText('Expiry')).toBeInTheDocument();
    expect(screen.getByTestId('qrcode')).toHaveAttribute(
      'data-value',
      'hive-keychain',
    );
    expect(
      PendingHiveAccountCreationUtils.getPendingHiveAccountCreationRequests,
    ).toHaveBeenCalledWith(mk);
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
      .mockResolvedValue([
        {
          ...pendingRequest,
          paymentCurrency: 'EVM:40:native',
          paymentChainId: '40',
          payerEvmAddress: '0x1111111111111111111111111111111111111111',
          paymentTokenSymbol: 'TLOS',
          paymentTokenDecimals: 18,
        },
      ]);

    renderComponent();

    expect(
      await screen.findByRole('button', { name: 'Pay with Keychain' }),
    ).toBeInTheDocument();
  });

  it.each([
    ['payment_pending', 'Payment pending'],
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
        await screen.findByTestId('pending-account-creation-keep-open-disclaimer'),
      ).toBeInTheDocument();
    },
  );

  it.each([
    ['expired', 'Expired'],
    ['underpaid', 'Underpaid'],
    ['paid_after_expiry', 'Paid after expiry'],
    ['username_unavailable', 'Username unavailable'],
    ['account_creation_failed', 'Account creation failed'],
    ['cancelled', 'Cancelled'],
  ] as [HiveAccountCreationStatus, string][])(
    'hides keep-open disclaimer for terminal %s status',
    async (status) => {
      jest
        .spyOn(
          PendingHiveAccountCreationUtils,
          'getPendingHiveAccountCreationRequests',
        )
        .mockResolvedValue([{ ...pendingRequest, status }]);

      renderComponent();

      expect(await screen.findByText('Current status')).toBeInTheDocument();
      expect(
        screen.queryByTestId('pending-account-creation-keep-open-disclaimer'),
      ).not.toBeInTheDocument();
    },
  );

  it.each([
    ['payment_pending', 'Payment pending'],
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

  const renderComponent = () => {
    const store = getFakeStore({
      ...initialEmptyStateStore,
      mk,
      navigation: {
        params: { requestId: 'request-1' },
        stack: [
          {
            currentPage: Screen.PENDING_ACCOUNT_CREATION_PAYMENT,
            params: { requestId: 'request-1' },
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
