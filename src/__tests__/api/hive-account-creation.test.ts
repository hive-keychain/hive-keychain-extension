import {
  createHiveAccountCreationQuote,
  getHiveAccountCreationStatus,
  submitHiveAccountCreationPaymentTx,
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
        paymentChainId: undefined,
        paymentTokenAddress: undefined,
        paymentTokenDecimals: undefined,
        payerEvmAddress: undefined,
        ownerPublicKey: 'STMpublicKey',
        activePublicKey: 'STMpublicKey',
        postingPublicKey: 'STMpublicKey',
        memoPublicKey: 'STMmemoPublicKey',
      },
    );
  });

  it('creates an EVM paid account creation quote and normalizes the backend response', async () => {
    jest.spyOn(KeychainApi, 'post').mockResolvedValue({
      requestId: 'request-1',
      username: 'new-account',
      status: 'payment_pending',
      amount: '2',
      currency: 'EVM:1:0xabc',
      chainId: '1',
      tokenAddress: '0xabc',
      priceUsd: '1.5',
      address: '0x1111111111111111111111111111111111111111',
      memo: 'account-creation:request-1',
      expiresAt: '2026-04-28T00:00:00.000Z',
    });

    await expect(
      createHiveAccountCreationQuote({
        username: 'new-account',
        paymentChainId: '1',
        paymentTokenAddress: '0xabc',
        paymentTokenDecimals: 6,
        payerEvmAddress: '0x1111111111111111111111111111111111111111',
        authorities: {
          owner: authority,
          active: authority,
          posting: authority,
          memo_key: 'STMmemoPublicKey',
        },
      }),
    ).resolves.toMatchObject({
      requestId: 'request-1',
      payment: {
        amount: '2',
        asset: 'EVM:1:0xabc',
        account: '0x1111111111111111111111111111111111111111',
        chainId: '1',
        tokenAddress: '0xabc',
        priceUsd: '1.5',
      },
    });

    expect(KeychainApi.post).toHaveBeenCalledWith(
      'hive/account-creation/quote',
      expect.objectContaining({
        username: 'new-account',
        paymentCurrency: undefined,
        paymentChainId: '1',
        paymentTokenAddress: '0xabc',
        paymentTokenDecimals: 6,
        payerEvmAddress: '0x1111111111111111111111111111111111111111',
        ownerPublicKey: 'STMpublicKey',
      }),
    );
  });

  it('gets paid account creation status by request id', async () => {
    jest.spyOn(KeychainApi, 'getWithResponse').mockResolvedValue({
      status: 200,
      data: {
        requestId: 'request/1',
        username: 'new-account',
        status: 'creating_account',
      },
    });

    await expect(
      getHiveAccountCreationStatus('request/1'),
    ).resolves.toMatchObject({
      requestId: 'request/1',
      status: 'creating_account',
    });

    expect(KeychainApi.getWithResponse).toHaveBeenCalledWith(
      'hive/account-creation/request%2F1',
    );
  });

  it('throws the backend error when paid account creation status is missing', async () => {
    jest.spyOn(KeychainApi, 'getWithResponse').mockResolvedValue({
      status: 404,
      data: { error: 'Request not found.' },
    });

    await expect(getHiveAccountCreationStatus('request/1')).rejects.toMatchObject(
      {
        message: 'Request not found.',
        status: 404,
        response: { error: 'Request not found.' },
      },
    );
  });

  it('submits an EVM payment tx hash by request id', async () => {
    jest.spyOn(KeychainApi, 'post').mockResolvedValue({
      requestId: 'request/1',
      username: 'new-account',
      status: 'payment_confirming',
      payment: {
        txId: '0xpayment',
      },
    });

    await expect(
      submitHiveAccountCreationPaymentTx('request/1', {
        txHash: '0xpayment',
        from: '0x1111111111111111111111111111111111111111',
      }),
    ).resolves.toMatchObject({
      requestId: 'request/1',
      status: 'payment_confirming',
    });

    expect(KeychainApi.post).toHaveBeenCalledWith(
      'hive/account-creation/request%2F1/payment-tx',
      {
        txHash: '0xpayment',
        from: '0x1111111111111111111111111111111111111111',
      },
    );
  });
});
