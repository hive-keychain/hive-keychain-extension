import LedgerModule from '@background/ledger.module';
import { broadcastSwap } from '@background/requests/operations/ops/swap';
import { RequestsHandler } from '@background/requests/request-handler';
import { PrivateKeyType } from '@interfaces/keys.interface';
import { HiveTxUtils } from '@popup/hive/utils/hive-tx.utils';
import { KeysUtils } from '@popup/hive/utils/keys.utils';
import TokensUtils from '@popup/hive/utils/tokens.utils';
import TransferUtils from '@popup/hive/utils/transfer.utils';
import { SwapTokenUtils } from 'src/utils/swap-token.utils';

describe('broadcastSwap', () => {
  const baseData = {
    username: 'alice',
    slippage: 0.5,
    startToken: 'HIVE',
    endToken: 'HBD',
    steps: [] as unknown[],
    amount: 1.234,
    swapAccount: 'swap.bot',
    partnerUsername: '',
    partnerFee: 0,
    request_id: 42,
  };

  beforeEach(() => {
    jest.spyOn(chrome.i18n, 'getMessage').mockImplementation((k) => String(k));
    jest.spyOn(SwapTokenUtils, 'saveEstimate').mockResolvedValue('est-id');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('throws when swapAccount is missing', async () => {
    const requestHandler = {
      getUserPrivateKey: jest.fn().mockReturnValue('k'),
    } as unknown as RequestsHandler;

    await broadcastSwap(requestHandler, {
      ...baseData,
      swapAccount: undefined,
    } as any);

    expect(SwapTokenUtils.saveEstimate).not.toHaveBeenCalled();
  });

  it('uses TransferUtils.sendTransfer for HIVE with a normal private key', async () => {
    const requestHandler = {
      getUserPrivateKey: jest.fn().mockReturnValue('priv'),
    } as unknown as RequestsHandler;
    jest.spyOn(KeysUtils, 'getKeyType').mockReturnValue(PrivateKeyType.PRIVATE_KEY);
    const send = jest.spyOn(TransferUtils, 'sendTransfer').mockResolvedValue({ tx_id: 'x' } as any);

    await broadcastSwap(requestHandler, baseData as any);

    expect(SwapTokenUtils.saveEstimate).toHaveBeenCalled();
    expect(send).toHaveBeenCalledWith(
      'alice',
      'swap.bot',
      expect.stringContaining('HIVE'),
      'est-id',
      false,
      0,
      0,
      'priv',
      undefined,
    );
  });

  it('uses TokensUtils.sendToken when start token is not HIVE/HBD', async () => {
    const requestHandler = {
      getUserPrivateKey: jest.fn().mockReturnValue('priv'),
    } as unknown as RequestsHandler;
    jest.spyOn(KeysUtils, 'getKeyType').mockReturnValue(PrivateKeyType.PRIVATE_KEY);
    jest.spyOn(TransferUtils, 'sendTransfer');
    const sendToken = jest.spyOn(TokensUtils, 'sendToken').mockResolvedValue({} as any);

    await broadcastSwap(requestHandler, {
      ...baseData,
      startToken: 'BTC',
    } as any);

    expect(sendToken).toHaveBeenCalledWith(
      'BTC',
      'swap.bot',
      expect.stringMatching(/1\.234/),
      'est-id',
      'priv',
      'alice',
      undefined,
    );
    expect(TransferUtils.sendTransfer).not.toHaveBeenCalled();
  });

  it('uses ledger path for HIVE when key type is LEDGER', async () => {
    const requestHandler = {
      getUserPrivateKey: jest.fn().mockReturnValue('ledger'),
    } as unknown as RequestsHandler;
    jest.spyOn(KeysUtils, 'getKeyType').mockReturnValue(PrivateKeyType.LEDGER);
    jest.spyOn(TransferUtils, 'getTransferTransaction').mockResolvedValue({ foo: 1 } as any);
    jest.spyOn(LedgerModule, 'signTransactionFromLedger').mockImplementation(() => {});
    jest.spyOn(LedgerModule, 'getSignatureFromLedger').mockResolvedValue('sig' as any);
    jest.spyOn(HiveTxUtils, 'broadcastAndConfirmTransactionWithSignature').mockResolvedValue({
      id: 'tx',
    } as any);

    await broadcastSwap(requestHandler, baseData as any);

    expect(TransferUtils.getTransferTransaction).toHaveBeenCalled();
    expect(HiveTxUtils.broadcastAndConfirmTransactionWithSignature).toHaveBeenCalled();
  });

  it('uses ledger path with engine token for non-HIVE start', async () => {
    const requestHandler = {
      getUserPrivateKey: jest.fn().mockReturnValue('ledger'),
    } as unknown as RequestsHandler;
    jest.spyOn(KeysUtils, 'getKeyType').mockReturnValue(PrivateKeyType.LEDGER);
    jest.spyOn(TokensUtils, 'getSendTokenTransaction').mockResolvedValue({ bar: 1 } as any);
    jest.spyOn(TransferUtils, 'getTransferTransaction');
    jest.spyOn(LedgerModule, 'signTransactionFromLedger').mockImplementation(() => {});
    jest.spyOn(LedgerModule, 'getSignatureFromLedger').mockResolvedValue('sig' as any);
    jest.spyOn(HiveTxUtils, 'broadcastAndConfirmTransactionWithSignature').mockResolvedValue({} as any);

    await broadcastSwap(requestHandler, {
      ...baseData,
      startToken: 'TKN',
    } as any);

    expect(TokensUtils.getSendTokenTransaction).toHaveBeenCalled();
    expect(TransferUtils.getTransferTransaction).not.toHaveBeenCalled();
  });
});
