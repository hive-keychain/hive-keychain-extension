import { PendingHiveAccountCreationUtils } from 'src/utils/pending-hive-account-creation.utils';
import { SavePendingHiveAccountCreationRequest } from '@interfaces/hive-account-creation.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import EncryptUtils from 'src/popup/hive/utils/encrypt.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

describe('pending-hive-account-creation.utils tests:\n', () => {
  const mk = 'test-master-key';
  const createdAt = '2026-04-28T00:00:00.000Z';
  const updatedAt = '2026-04-28T00:01:00.000Z';
  const pendingRequest: SavePendingHiveAccountCreationRequest = {
    requestId: 'request-1',
    username: 'new-account',
    encryptedAccount: 'encrypted-pending-account-payload',
    paymentCurrency: 'HIVE',
    paymentAddress: 'hive-keychain',
    memo: 'request-1',
    amount: '3.000',
    expiresAt: '2026-04-28T01:00:00.000Z',
    status: 'payment_pending',
    createdAt,
    updatedAt,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('saves pending requests in separate encrypted storage', async () => {
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue(undefined);
    const saveSpy = jest.spyOn(LocalStorageUtils, 'saveValueInLocalStorage');

    await expect(
      PendingHiveAccountCreationUtils.savePendingHiveAccountCreationRequest(
        {
          ...pendingRequest,
          privateKeys: { active: 'must-not-be-stored' },
        } as unknown as SavePendingHiveAccountCreationRequest,
        mk,
      ),
    ).resolves.toEqual(pendingRequest);

    expect(saveSpy).toHaveBeenCalledWith(
      LocalStorageKeyEnum.PENDING_HIVE_ACCOUNT_CREATIONS,
      expect.any(String),
    );
    expect(saveSpy).not.toHaveBeenCalledWith(
      LocalStorageKeyEnum.ACCOUNTS,
      expect.anything(),
    );

    const encryptedPayload = saveSpy.mock.calls[0][1] as string;
    const decryptedPayload = await EncryptUtils.decryptToJson(
      encryptedPayload,
      mk,
    );
    expect(decryptedPayload).toEqual({ list: [pendingRequest] });
    expect(JSON.stringify(decryptedPayload)).not.toContain('must-not-be-stored');
  });

  it('gets pending requests from encrypted storage', async () => {
    const encryptedPayload = await EncryptUtils.encryptJson(
      { list: [pendingRequest] },
      mk,
    );
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue(encryptedPayload);

    await expect(
      PendingHiveAccountCreationUtils.getPendingHiveAccountCreationRequests(mk),
    ).resolves.toEqual([pendingRequest]);

    expect(LocalStorageUtils.getValueFromLocalStorage).toHaveBeenCalledWith(
      LocalStorageKeyEnum.PENDING_HIVE_ACCOUNT_CREATIONS,
    );
  });

  it('returns an empty list when there are no pending requests', async () => {
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue(undefined);

    await expect(
      PendingHiveAccountCreationUtils.getPendingHiveAccountCreationRequests(mk),
    ).resolves.toEqual([]);
  });

  it('updates pending request status and checked timestamps', async () => {
    const encryptedPayload = await EncryptUtils.encryptJson(
      { list: [pendingRequest] },
      mk,
    );
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue(encryptedPayload);
    const saveSpy = jest.spyOn(LocalStorageUtils, 'saveValueInLocalStorage');
    jest
      .spyOn(Date.prototype, 'toISOString')
      .mockReturnValue('2026-04-28T02:00:00.000Z');

    await expect(
      PendingHiveAccountCreationUtils.updatePendingHiveAccountCreationStatus(
        'request-1',
        'payment_detected',
        mk,
      ),
    ).resolves.toMatchObject({
      requestId: 'request-1',
      status: 'payment_detected',
      updatedAt: '2026-04-28T02:00:00.000Z',
      lastCheckedAt: '2026-04-28T02:00:00.000Z',
    });

    const decryptedPayload = await EncryptUtils.decryptToJson(
      saveSpy.mock.calls[0][1] as string,
      mk,
    );
    expect(decryptedPayload.list[0]).toMatchObject({
      status: 'payment_detected',
      updatedAt: '2026-04-28T02:00:00.000Z',
      lastCheckedAt: '2026-04-28T02:00:00.000Z',
    });
  });

  it('does not persist when updating an unknown pending request', async () => {
    const encryptedPayload = await EncryptUtils.encryptJson(
      { list: [pendingRequest] },
      mk,
    );
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue(encryptedPayload);
    const saveSpy = jest.spyOn(LocalStorageUtils, 'saveValueInLocalStorage');

    await expect(
      PendingHiveAccountCreationUtils.updatePendingHiveAccountCreationStatus(
        'missing-request',
        'expired',
        mk,
      ),
    ).resolves.toBeUndefined();

    expect(saveSpy).not.toHaveBeenCalled();
  });

  it('removes a pending request', async () => {
    const otherRequest = {
      ...pendingRequest,
      requestId: 'request-2',
      username: 'other-account',
    };
    const encryptedPayload = await EncryptUtils.encryptJson(
      { list: [pendingRequest, otherRequest] },
      mk,
    );
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue(encryptedPayload);
    const saveSpy = jest.spyOn(LocalStorageUtils, 'saveValueInLocalStorage');

    await PendingHiveAccountCreationUtils.removePendingHiveAccountCreationRequest(
      'request-1',
      mk,
    );

    const decryptedPayload = await EncryptUtils.decryptToJson(
      saveSpy.mock.calls[0][1] as string,
      mk,
    );
    expect(decryptedPayload).toEqual({ list: [otherRequest] });
  });
});
