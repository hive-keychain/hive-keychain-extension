import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as HiveAccountCreationApi from '@api/hive-account-creation';
import {
  HiveAccountCreationStatus,
  PendingHiveAccountCreationRequest,
} from '@interfaces/hive-account-creation.interface';
import { Screen } from '@interfaces/screen.interface';
import React from 'react';
import { Provider } from 'react-redux';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import * as copyToastUtils from 'src/common-ui/toast/copy-toast.utils';
import { PendingAccountCreationPaymentComponent } from 'src/popup/hive/pages/app-container/settings/accounts/create-account/pending-account-creation-payment/pending-account-creation-payment.component';
import { PendingHiveAccountCreationUtils } from 'src/utils/pending-hive-account-creation.utils';

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
    jest
      .spyOn(copyToastUtils, 'copyTextWithToast')
      .mockResolvedValue(true);
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

  it('refreshes status manually and updates local pending status', async () => {
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
    jest
      .spyOn(HiveAccountCreationApi, 'getHiveAccountCreationStatus')
      .mockResolvedValue({
        requestId: 'request-1',
        username: 'new-account',
        status: 'payment_detected',
      });
    jest
      .spyOn(
        PendingHiveAccountCreationUtils,
        'updatePendingHiveAccountCreationStatus',
      )
      .mockResolvedValue(updatedRequest);

    renderComponent();

    fireEvent.click(
      await screen.findByRole('button', { name: 'Refresh status' }),
    );

    await waitFor(() => {
      expect(
        HiveAccountCreationApi.getHiveAccountCreationStatus,
      ).toHaveBeenCalledWith('request-1');
    });
    expect(
      PendingHiveAccountCreationUtils.updatePendingHiveAccountCreationStatus,
    ).toHaveBeenCalledWith('request-1', 'payment_detected', mk);
    expect(await screen.findByText('Payment detected')).toBeInTheDocument();
  });

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

  const renderComponent = () =>
    render(
      <Provider
        store={getFakeStore({
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
        } as any)}>
        <PendingAccountCreationPaymentComponent />
      </Provider>,
    );
});
