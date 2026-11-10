import { sendEvmTransaction } from '@background/evm/requests/operations/ops/send-transaction';
import { EvmAccountSource } from '@popup/evm/interfaces/wallet.interface';

const sendTransactionMock = jest.fn();

jest.mock('@popup/evm/utils/evm-transactions.utils', () => ({
  EvmTransactionsUtils: {
    send: (...args: unknown[]) => sendTransactionMock(...args),
  },
}));

describe('sendEvmTransaction operation', () => {
  const ledgerWallet = {
    source: EvmAccountSource.LEDGER,
    address: '0x0000000000000000000000000000000000000001',
    path: "m/44'/60'/0'/0/0",
    index: 0,
  };
  const requestHandler = {
    accounts: [{ wallet: ledgerWallet }],
    getRequestDataByLocator: jest.fn(() => ({ tab: 12 })),
  };
  const locator = {
    requestId: 1,
    tab: 12,
    origin: 'https://example.com',
  };
  const gasFee = {
    baseFeePerGasInGwei: 1,
    estimatedFeeInEth: 0.000021,
    gasPriceInGwei: 1,
    maxFeePerGasInGwei: 1,
    priorityFeeInGwei: 1,
    gasLimit: 21000,
    maxFeeInEth: 0.000021,
  };

  beforeEach(() => {
    sendTransactionMock.mockReset();
    requestHandler.getRequestDataByLocator.mockClear();
    global.chrome = {
      i18n: {
        getMessage: jest.fn(() => 'Transaction sent'),
      },
    } as any;
  });

  it('routes Ledger send transaction requests through EvmTransactionsUtils', async () => {
    sendTransactionMock.mockResolvedValue({ hash: '0xtransactionhash' });
    const transaction = {
      from: ledgerWallet.address,
      to: '0x0000000000000000000000000000000000000002',
      value: '0x0',
      data: '0x',
    };

    await expect(
      sendEvmTransaction(
        requestHandler as any,
        {
          request_id: 1,
          params: [transaction],
          chainId: '0x1',
        } as any,
        locator,
        { gasFee },
      ),
    ).resolves.toMatchObject({
      msg: {
        success: true,
        result: '0xtransactionhash',
        request_id: 1,
        tab: 12,
      },
    });

    expect(sendTransactionMock).toHaveBeenCalledWith(
      ledgerWallet,
      transaction,
      expect.objectContaining({
        gasLimit: expect.anything(),
        gasPriceInGwei: expect.anything(),
      }),
      '0x1',
    );
  });
});
