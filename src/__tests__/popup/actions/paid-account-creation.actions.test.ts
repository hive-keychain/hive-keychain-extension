import * as HiveAccountCreationApi from '@api/hive-account-creation';
import { PendingHiveAccountCreationRequest } from '@interfaces/hive-account-creation.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import {
  handleCompletedPaidHiveAccountCreations,
  synchronizePendingHiveAccountCreation,
  synchronizePendingHiveAccountCreations,
} from '@popup/hive/actions/paid-account-creation.actions';
import { PaidAccountCreationNotificationsUtils } from '@popup/hive/utils/paid-account-creation-notifications.utils';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import EncryptUtils from 'src/popup/hive/utils/encrypt.utils';
import { KeysUtils } from 'src/popup/hive/utils/keys.utils';
import { PendingHiveAccountCreationUtils } from 'src/utils/pending-hive-account-creation.utils';
import Logger from 'src/utils/logger.utils';

describe('paid-account-creation.actions', () => {
  const mk = 'test-master-key';
  const pendingAccount: LocalAccount = {
    name: 'new-account',
    keys: {
      active: 'active-private',
      activePubkey: 'active-public',
      posting: 'posting-private',
      postingPubkey: 'posting-public',
      memo: 'memo-private',
      memoPubkey: 'memo-public',
    },
  };
  const pendingRequest: PendingHiveAccountCreationRequest = {
    requestId: 'request-1',
    username: pendingAccount.name,
    encryptedAccount: 'encrypted-pending-account',
    paymentCurrency: 'EVM:1:native',
    paymentAddress: '0x1111111111111111111111111111111111111111',
    amount: '0.001',
    expiresAt: '2026-04-28T01:00:00.000Z',
    status: 'payment_confirming',
    createdAt: '2026-04-28T00:00:00.000Z',
    updatedAt: '2026-04-28T00:00:00.000Z',
  };

  beforeEach(() => {
    jest.restoreAllMocks();
    jest
      .spyOn(PendingHiveAccountCreationUtils, 'getPendingHiveAccountCreationRequests')
      .mockResolvedValue([pendingRequest]);
    jest
      .spyOn(PendingHiveAccountCreationUtils, 'updatePendingHiveAccountCreationStatus')
      .mockImplementation(async (_requestId, status, _mk, paymentTxHash) => ({
        ...pendingRequest,
        status,
        paymentTxHash,
      }));
    jest
      .spyOn(PendingHiveAccountCreationUtils, 'removePendingHiveAccountCreationRequest')
      .mockResolvedValue();
    jest
      .spyOn(HiveAccountCreationApi, 'getHiveAccountCreationStatus')
      .mockResolvedValue({
        requestId: pendingRequest.requestId,
        username: pendingRequest.username,
        status: 'payment_detected',
        payment: { txId: '0xpayment' },
      });
    jest.spyOn(AccountUtils, 'saveAccounts').mockResolvedValue();
    jest.spyOn(EncryptUtils, 'decryptToJson').mockResolvedValue({
      list: [pendingAccount],
    });
    jest
      .spyOn(KeysUtils, 'getPublicKeyFromPrivateKeyString')
      .mockImplementation((privateKey) =>
        privateKey.replace('-private', '-public'),
      );
    jest.spyOn(Logger, 'error').mockImplementation();
  });

  it('updates non-completed statuses without importing an account', async () => {
    const store = getStore();

    await expect(
      store.dispatch<any>(
        synchronizePendingHiveAccountCreation(pendingRequest.requestId),
      ),
    ).resolves.toMatchObject({
      outcome: 'updated',
      request: {
        status: 'payment_detected',
        paymentTxHash: '0xpayment',
      },
    });

    expect(AccountUtils.saveAccounts).not.toHaveBeenCalled();
    expect(
      PendingHiveAccountCreationUtils.removePendingHiveAccountCreationRequest,
    ).not.toHaveBeenCalled();
    expect(store.getState().hive.accounts).toEqual([]);
  });

  it('durably saves and imports an account before removing its pending request', async () => {
    jest
      .spyOn(HiveAccountCreationApi, 'getHiveAccountCreationStatus')
      .mockResolvedValue({
        requestId: pendingRequest.requestId,
        username: pendingRequest.username,
        status: 'account_created',
      });
    const store = getStore();

    await expect(
      store.dispatch<any>(
        synchronizePendingHiveAccountCreation(pendingRequest.requestId),
      ),
    ).resolves.toMatchObject({
      outcome: 'imported',
      account: pendingAccount,
    });

    expect(AccountUtils.saveAccounts).toHaveBeenCalledWith([pendingAccount], mk);
    expect(
      PendingHiveAccountCreationUtils.removePendingHiveAccountCreationRequest,
    ).toHaveBeenCalledWith(pendingRequest.requestId, mk);
    expect(
      (AccountUtils.saveAccounts as jest.Mock).mock.invocationCallOrder[0],
    ).toBeLessThan(
      (
        PendingHiveAccountCreationUtils.removePendingHiveAccountCreationRequest as jest.Mock
      ).mock.invocationCallOrder[0],
    );
    expect(store.getState().hive.accounts).toEqual([pendingAccount]);
  });

  it('keeps an existing local account without overwriting or duplicating it', async () => {
    const existingAccount = {
      name: pendingRequest.username,
      keys: { posting: 'existing-posting-key' },
    } as LocalAccount;
    jest
      .spyOn(HiveAccountCreationApi, 'getHiveAccountCreationStatus')
      .mockResolvedValue({
        requestId: pendingRequest.requestId,
        username: pendingRequest.username,
        status: 'account_created',
      });
    const store = getStore([existingAccount]);

    await expect(
      store.dispatch<any>(
        synchronizePendingHiveAccountCreation(pendingRequest.requestId),
      ),
    ).resolves.toMatchObject({
      outcome: 'already_imported',
      account: existingAccount,
    });

    expect(EncryptUtils.decryptToJson).not.toHaveBeenCalled();
    expect(AccountUtils.saveAccounts).not.toHaveBeenCalled();
    expect(store.getState().hive.accounts).toEqual([existingAccount]);
    expect(
      PendingHiveAccountCreationUtils.removePendingHiveAccountCreationRequest,
    ).toHaveBeenCalledWith(pendingRequest.requestId, mk);
  });

  it('removes a stale pending request when the account is already local', async () => {
    const existingAccount = {
      name: pendingRequest.username,
      keys: { posting: 'existing-posting-key' },
    } as LocalAccount;
    const store = getStore([existingAccount]);

    await expect(
      store.dispatch<any>(
        synchronizePendingHiveAccountCreation(pendingRequest.requestId),
      ),
    ).resolves.toMatchObject({
      outcome: 'already_imported',
      account: existingAccount,
    });

    expect(
      HiveAccountCreationApi.getHiveAccountCreationStatus,
    ).not.toHaveBeenCalled();
    expect(
      PendingHiveAccountCreationUtils.removePendingHiveAccountCreationRequest,
    ).toHaveBeenCalledWith(pendingRequest.requestId, mk);
  });

  it('retains the pending request when encrypted account validation fails', async () => {
    jest
      .spyOn(HiveAccountCreationApi, 'getHiveAccountCreationStatus')
      .mockResolvedValue({
        requestId: pendingRequest.requestId,
        username: pendingRequest.username,
        status: 'account_created',
      });
    jest.spyOn(EncryptUtils, 'decryptToJson').mockResolvedValue({
      list: [{ ...pendingAccount, name: 'unexpected-account' }],
    });
    const store = getStore();

    await expect(
      store.dispatch<any>(
        synchronizePendingHiveAccountCreation(pendingRequest.requestId),
      ),
    ).rejects.toThrow('Invalid pending Hive account data.');

    expect(AccountUtils.saveAccounts).not.toHaveBeenCalled();
    expect(
      PendingHiveAccountCreationUtils.removePendingHiveAccountCreationRequest,
    ).not.toHaveBeenCalled();
  });

  it('retains the pending request when durable account storage fails', async () => {
    jest
      .spyOn(HiveAccountCreationApi, 'getHiveAccountCreationStatus')
      .mockResolvedValue({
        requestId: pendingRequest.requestId,
        username: pendingRequest.username,
        status: 'account_created',
      });
    jest
      .spyOn(AccountUtils, 'saveAccounts')
      .mockRejectedValue(new Error('storage failed'));
    const store = getStore();

    await expect(
      store.dispatch<any>(
        synchronizePendingHiveAccountCreation(pendingRequest.requestId),
      ),
    ).rejects.toThrow('storage failed');

    expect(store.getState().hive.accounts).toEqual([]);
    expect(
      PendingHiveAccountCreationUtils.removePendingHiveAccountCreationRequest,
    ).not.toHaveBeenCalled();
  });

  it('skips overlapping synchronization for the same request', async () => {
    let resolveStatus: (status: {
      requestId: string;
      username: string;
      status: 'payment_confirming';
    }) => void = () => undefined;
    jest
      .spyOn(HiveAccountCreationApi, 'getHiveAccountCreationStatus')
      .mockReturnValue(
        new Promise((resolve) => {
          resolveStatus = resolve;
        }),
      );
    const store = getStore();

    const firstSynchronization = store.dispatch<any>(
      synchronizePendingHiveAccountCreation(pendingRequest.requestId),
    );
    await Promise.resolve();
    await Promise.resolve();

    await expect(
      store.dispatch<any>(
        synchronizePendingHiveAccountCreation(pendingRequest.requestId),
      ),
    ).resolves.toEqual({ outcome: 'skipped' });

    resolveStatus({
      requestId: pendingRequest.requestId,
      username: pendingRequest.username,
      status: 'payment_confirming',
    });
    await firstSynchronization;
    expect(HiveAccountCreationApi.getHiveAccountCreationStatus).toHaveBeenCalledTimes(
      1,
    );
  });

  it('shows a browser notification when completing imports away from the status page', async () => {
    jest
      .spyOn(
        PaidAccountCreationNotificationsUtils,
        'showAccountCreatedNotification',
      )
      .mockResolvedValue();
    const store = getStore();

    await store.dispatch<any>(
      handleCompletedPaidHiveAccountCreations(
        [
          {
            outcome: 'imported',
            account: pendingAccount,
            request: pendingRequest,
          },
        ],
        { showBrowserNotification: true, showSuccessMessage: false },
      ),
    );

    expect(
      PaidAccountCreationNotificationsUtils.showAccountCreatedNotification,
    ).toHaveBeenCalledWith(pendingAccount.name, pendingRequest.requestId);
  });

  it('continues synchronizing remaining requests after one fails', async () => {
    const secondRequest = {
      ...pendingRequest,
      requestId: 'request-2',
      username: 'second-account',
    };
    jest
      .spyOn(PendingHiveAccountCreationUtils, 'getPendingHiveAccountCreationRequests')
      .mockResolvedValue([pendingRequest, secondRequest]);
    jest
      .spyOn(HiveAccountCreationApi, 'getHiveAccountCreationStatus')
      .mockRejectedValueOnce(new Error('temporary failure'))
      .mockResolvedValueOnce({
        requestId: secondRequest.requestId,
        username: secondRequest.username,
        status: 'payment_confirming',
      });
    const store = getStore();

    await expect(
      store.dispatch<any>(synchronizePendingHiveAccountCreations()),
    ).resolves.toHaveLength(1);

    expect(HiveAccountCreationApi.getHiveAccountCreationStatus).toHaveBeenCalledWith(
      pendingRequest.requestId,
    );
    expect(HiveAccountCreationApi.getHiveAccountCreationStatus).toHaveBeenCalledWith(
      secondRequest.requestId,
    );
    expect(Logger.error).toHaveBeenCalled();
  });

  const getStore = (accounts: LocalAccount[] = []) =>
    getFakeStore({
      ...initialEmptyStateStore,
      mk,
      hive: {
        ...initialEmptyStateStore.hive,
        accounts,
      },
    } as any);
});
