import { KeychainApi } from '@api/keychain';
import { SavePendingHiveAccountCreationRequest } from '@interfaces/hive-account-creation.interface';
import EncryptUtils from 'src/popup/hive/utils/encrypt.utils';
import { GeneratedKeys } from 'src/popup/hive/utils/account-creation.utils';
import { PaidAccountCreationUtils } from 'src/popup/hive/utils/paid-account-creation.utils';
import { PendingHiveAccountCreationUtils } from 'src/utils/pending-hive-account-creation.utils';

describe('paid-account-creation.utils tests:\n', () => {
  const mk = 'test-master-key';
  const generatedKeys = {
    owner: { public: 'STMownerPublic', private: 'owner-private-key' },
    active: { public: 'STMactivePublic', private: 'active-private-key' },
    posting: { public: 'STMpostingPublic', private: 'posting-private-key' },
    memo: { public: 'STMmemoPublic', private: 'memo-private-key' },
  } as GeneratedKeys;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('quotes with public keys and stores encrypted pending account payload', async () => {
    jest.spyOn(KeychainApi, 'post').mockResolvedValue({
      requestId: 'request-1',
      username: 'new-account',
      status: 'payment_pending',
      fee: '3.000 HIVE',
      payment: {
        account: 'hive-keychain',
        amount: '3.000',
        asset: 'HIVE',
        memo: 'request-1',
      },
      expiresAt: '2026-04-28T00:00:00.000Z',
    });
    const saveSpy = jest
      .spyOn(
        PendingHiveAccountCreationUtils,
        'savePendingHiveAccountCreationRequest',
      )
      .mockImplementation(
        async (request) => request as SavePendingHiveAccountCreationRequest as any,
      );

    await PaidAccountCreationUtils.createPendingPaidHiveAccountCreation(
      'new-account',
      generatedKeys,
      'HIVE',
      mk,
    );

    expect(KeychainApi.post).toHaveBeenCalledWith(
      'hive/account-creation/quote',
      {
        username: 'new-account',
        paymentCurrency: 'HIVE',
        authorities: {
          owner: {
            weight_threshold: 1,
            account_auths: [],
            key_auths: [['STMownerPublic', 1]],
          },
          active: {
            weight_threshold: 1,
            account_auths: [],
            key_auths: [['STMactivePublic', 1]],
          },
          posting: {
            weight_threshold: 1,
            account_auths: [],
            key_auths: [['STMpostingPublic', 1]],
          },
          memo_key: 'STMmemoPublic',
        },
      },
    );
    expect(JSON.stringify((KeychainApi.post as jest.Mock).mock.calls[0][1])).not.toContain(
      'private-key',
    );

    expect(saveSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: 'request-1',
        username: 'new-account',
        paymentCurrency: 'HIVE',
        paymentAddress: 'hive-keychain',
        memo: 'request-1',
        amount: '3.000',
        expiresAt: '2026-04-28T00:00:00.000Z',
        status: 'payment_pending',
      }),
      mk,
    );
    const encryptedAccount = saveSpy.mock.calls[0][0].encryptedAccount;
    expect(encryptedAccount).not.toContain('active-private-key');
    await expect(EncryptUtils.decryptToJson(encryptedAccount, mk)).resolves.toEqual(
      {
        list: [
          {
            name: 'new-account',
            keys: {
              active: 'active-private-key',
              activePubkey: 'STMactivePublic',
              posting: 'posting-private-key',
              postingPubkey: 'STMpostingPublic',
              memo: 'memo-private-key',
              memoPubkey: 'STMmemoPublic',
            },
          },
        ],
      },
    );
  });
});
