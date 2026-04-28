import {
  createHiveAccountCreationQuote,
  getHiveAccountCreationStatus,
} from '@api/hive-account-creation';
import { KeychainApi } from '@api/keychain';
import { CreateHiveAccountCreationQuoteRequest } from '@interfaces/hive-account-creation.interface';

describe('Hive account creation API', () => {
  const authority = {
    weight_threshold: 1,
    account_auths: [],
    key_auths: [['STMpublicKey', 1]],
  } as CreateHiveAccountCreationQuoteRequest['authorities']['owner'];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a paid account creation quote with public authorities only', async () => {
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

    const quoteRequest = {
      username: 'new-account',
      paymentCurrency: 'HIVE',
      authorities: {
        owner: authority,
        active: authority,
        posting: authority,
        memo_key: 'STMmemoPublicKey',
        private: 'must-not-be-sent',
      },
      privateKeys: {
        owner: 'must-not-be-sent',
      },
    } as unknown as CreateHiveAccountCreationQuoteRequest;

    await expect(
      createHiveAccountCreationQuote(quoteRequest),
    ).resolves.toMatchObject({
      requestId: 'request-1',
      fee: '3.000 HIVE',
    });

    expect(KeychainApi.post).toHaveBeenCalledWith(
      'hive/account-creation/quote',
      {
        username: 'new-account',
        paymentCurrency: 'HIVE',
        authorities: {
          owner: authority,
          active: authority,
          posting: authority,
          memo_key: 'STMmemoPublicKey',
        },
      },
    );
  });

  it('gets paid account creation status by request id', async () => {
    jest.spyOn(KeychainApi, 'get').mockResolvedValue({
      requestId: 'request/1',
      username: 'new-account',
      status: 'creating_account',
    });

    await expect(
      getHiveAccountCreationStatus('request/1'),
    ).resolves.toMatchObject({
      requestId: 'request/1',
      status: 'creating_account',
    });

    expect(KeychainApi.get).toHaveBeenCalledWith(
      'hive/account-creation/status/request%2F1',
    );
  });
});
