import LedgerModule from '@background/ledger.module';
import { broadcastSavings } from '@background/requests/operations/ops/savings';
import { RequestsHandler } from '@background/requests/request-handler';
import { PrivateKeyType } from '@interfaces/keys.interface';
import { HiveTxUtils } from '@popup/hive/utils/hive-tx.utils';
import { KeysUtils } from '@popup/hive/utils/keys.utils';
import { SavingsUtils } from '@popup/hive/utils/savings.utils';

describe('broadcastSavings', () => {
  const base = {
    username: 'alice',
    to: 'alice',
    amount: '1.000',
    currency: 'HBD',
    memo: '',
    request_id: 1,
  };

  beforeEach(() => {
    jest.spyOn(chrome.i18n, 'getMessage').mockImplementation((k) => String(k));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deposits with active key when key type is private key', async () => {
    const requestHandler = {
      data: { key: 'activeWif' },
    } as unknown as RequestsHandler;
    jest.spyOn(KeysUtils, 'getKeyType').mockReturnValue(PrivateKeyType.PRIVATE_KEY);
    const deposit = jest.spyOn(SavingsUtils, 'deposit').mockResolvedValue({ tx_id: 'abc' } as any);

    await broadcastSavings(requestHandler, {
      ...base,
      operation: 'deposit',
    } as any);

    expect(deposit).toHaveBeenCalledWith(
      '1.000 HBD',
      'alice',
      'alice',
      'activeWif',
      undefined,
      '',
    );
  });

  it('withdraws when operation is withdraw', async () => {
    const requestHandler = {
      data: { key: 'activeWif' },
    } as unknown as RequestsHandler;
    jest.spyOn(KeysUtils, 'getKeyType').mockReturnValue(PrivateKeyType.PRIVATE_KEY);
    const withdraw = jest.spyOn(SavingsUtils, 'withdraw').mockResolvedValue({ tx_id: 'w' } as any);

    await broadcastSavings(requestHandler, {
      ...base,
      operation: 'withdraw',
    } as any);

    expect(withdraw).toHaveBeenCalled();
  });

  it('uses ledger path: create tx, sign, broadcast', async () => {
    const requestHandler = {
      data: { key: 'ledgerKey' },
    } as unknown as RequestsHandler;
    jest.spyOn(KeysUtils, 'getKeyType').mockReturnValue(PrivateKeyType.LEDGER);
    jest.spyOn(SavingsUtils, 'getDepositOperation').mockResolvedValue(['op'] as any);
    jest.spyOn(HiveTxUtils, 'createTransaction').mockResolvedValue({ tx: 1 } as any);
    jest.spyOn(LedgerModule, 'signTransactionFromLedger').mockImplementation(() => {});
    jest.spyOn(LedgerModule, 'getSignatureFromLedger').mockResolvedValue('sig' as any);
    jest.spyOn(HiveTxUtils, 'broadcastAndConfirmTransactionWithSignature').mockResolvedValue({
      tx_id: 'ledger-tx',
    } as any);

    await broadcastSavings(requestHandler, {
      ...base,
      operation: 'deposit',
    } as any);

    expect(SavingsUtils.getDepositOperation).toHaveBeenCalledWith(
      'alice',
      'alice',
      '1.000 HBD',
      '',
    );
    expect(HiveTxUtils.broadcastAndConfirmTransactionWithSignature).toHaveBeenCalled();
  });

  it('fills key from getUserPrivateKey when data.key is missing', async () => {
    const requestHandler = {
      data: {},
      getUserPrivateKey: jest.fn().mockReturnValue('fromHandler'),
    } as unknown as RequestsHandler;
    jest.spyOn(KeysUtils, 'getKeyType').mockReturnValue(PrivateKeyType.PRIVATE_KEY);
    jest.spyOn(SavingsUtils, 'deposit').mockResolvedValue({} as any);

    await broadcastSavings(requestHandler, {
      ...base,
      operation: 'deposit',
    } as any);

    expect(requestHandler.getUserPrivateKey).toHaveBeenCalledWith(
      'alice',
      expect.any(String),
    );
    expect(SavingsUtils.deposit).toHaveBeenCalledWith(
      expect.any(String),
      'alice',
      'alice',
      'fromHandler',
      undefined,
      '',
    );
  });
});
