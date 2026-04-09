import { EvmPendingTransactionsNotifications } from '@popup/evm/utils/evm-pending-transactions-notifications.utils';
import { EvmRequestsUtils } from '@popup/evm/utils/evm-requests.utils';
import { EvmTokensHistoryParserUtils } from '@popup/evm/utils/evm-tokens-history-parser.utils';
import { EvmTransactionsUtils } from '@popup/evm/utils/evm-transactions.utils';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

jest.mock('ethers', () => {
  const actual = jest.requireActual('ethers');

  class TransactionResponse {
    hash: string;
    nonce: number;
    chainId: string;
    provider: any;

    constructor(params: any, provider: any) {
      Object.assign(this, params);
      this.provider = provider;
    }

    wait = jest.fn();

    toJSON() {
      return {
        hash: this.hash,
        nonce: this.nonce,
        chainId: this.chainId,
      };
    }
  }

  return {
    ...actual,
    TransactionResponse,
  };
});

describe('evm transactions utils', () => {
  const chain = {
    chainId: '0x1',
    mainToken: 'ETH',
  } as any;
  const walletAddress = '0xabc';

  let pendingTransactionsStorage: any[];
  let provider: {
    getTransactionCount: jest.Mock;
    getTransactionReceipt: jest.Mock;
  };

  beforeEach(() => {
    pendingTransactionsStorage = [];
    provider = {
      getTransactionCount: jest.fn(),
      getTransactionReceipt: jest.fn(),
    };

    chrome.i18n.getMessage = jest.fn((key: string) => key);

    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation(async (key) => {
        if (key === LocalStorageKeyEnum.EVM_PENDING_TRANSACTIONS) {
          return pendingTransactionsStorage;
        }

        return undefined;
      });
    jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockImplementation(async (key, value) => {
        if (key === LocalStorageKeyEnum.EVM_PENDING_TRANSACTIONS) {
          pendingTransactionsStorage = value;
        }
      });
    jest.spyOn(EthersUtils, 'getProvider').mockResolvedValue(provider as any);
    jest.spyOn(ChainUtils, 'getChain').mockResolvedValue(chain);
    jest
      .spyOn(EvmPendingTransactionsNotifications, 'waitForTransaction')
      .mockResolvedValue(undefined);
    jest
      .spyOn(EvmTokensHistoryParserUtils, 'parseEvent')
      .mockResolvedValue({ label: 'Pending swap' } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uses the blocking pending nonce when resolving pending transaction details', async () => {
    pendingTransactionsStorage = [
      {
        txResponseParams: { hash: '0xblocking', nonce: 0, chainId: chain.chainId },
        walletAddress,
        chainId: chain.chainId,
        broadcastDate: 1,
      },
      {
        txResponseParams: { hash: '0xqueued', nonce: 1, chainId: chain.chainId },
        walletAddress,
        chainId: chain.chainId,
        broadcastDate: 2,
      },
    ];

    jest
      .spyOn(EvmRequestsUtils, 'getNonce')
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(0);

    const result = await EvmTransactionsUtils.hasPendingTransaction(
      { address: walletAddress } as any,
      chain,
    );

    expect(result).toMatchObject({
      hasPending: true,
      pendingTransactionsCount: 1,
      queuedTransactionsCount: 1,
      pendingTransactionDetails: {
        label: 'Pending swap',
        nonce: 0,
      },
    });
    expect(result?.pendingTransactionDetails.transactionResponse).toMatchObject({
      hash: '0xblocking',
      nonce: 0,
    });
  });

  it('falls back to the unknown pending label when the blocking nonce is not in local storage', async () => {
    pendingTransactionsStorage = [
      {
        txResponseParams: { hash: '0xqueued', nonce: 1, chainId: chain.chainId },
        walletAddress,
        chainId: chain.chainId,
        broadcastDate: 2,
      },
    ];

    jest
      .spyOn(EvmRequestsUtils, 'getNonce')
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(0);

    const result = await EvmTransactionsUtils.hasPendingTransaction(
      { address: walletAddress } as any,
      chain,
    );

    expect(result?.pendingTransactionDetails).toEqual({
      label: 'evm_unknown_pending_transaction',
      title: 'evm_pending_queued_transactions',
      nonce: 0,
    });
    expect(EvmTokensHistoryParserUtils.parseEvent).not.toHaveBeenCalled();
  });

  it('removes already confirmed transactions during rehydration', async () => {
    pendingTransactionsStorage = [
      {
        txResponseParams: { hash: '0xconfirmed', nonce: 5, chainId: chain.chainId },
        walletAddress,
        chainId: chain.chainId,
        broadcastDate: 1,
      },
    ];
    provider.getTransactionReceipt.mockResolvedValue({ hash: '0xconfirmed' });

    await EvmTransactionsUtils.rehydratePendingTransactions();

    expect(pendingTransactionsStorage).toEqual([]);
    expect(
      EvmPendingTransactionsNotifications.waitForTransaction,
    ).not.toHaveBeenCalled();
  });

  it('removes stale transactions when the latest confirmed nonce already passed them', async () => {
    pendingTransactionsStorage = [
      {
        txResponseParams: { hash: '0xstale', nonce: 5, chainId: chain.chainId },
        walletAddress,
        chainId: chain.chainId,
        broadcastDate: 1,
      },
    ];
    provider.getTransactionReceipt.mockResolvedValue(null);
    provider.getTransactionCount.mockResolvedValue(6);

    await EvmTransactionsUtils.rehydratePendingTransactions();

    expect(pendingTransactionsStorage).toEqual([]);
    expect(
      EvmPendingTransactionsNotifications.waitForTransaction,
    ).not.toHaveBeenCalled();
  });

  it('restarts waiting for transactions that are still pending during rehydration', async () => {
    pendingTransactionsStorage = [
      {
        txResponseParams: { hash: '0xpending', nonce: 5, chainId: chain.chainId },
        walletAddress,
        chainId: chain.chainId,
        broadcastDate: 1,
      },
    ];
    provider.getTransactionReceipt.mockResolvedValue(null);
    provider.getTransactionCount.mockResolvedValue(5);

    await EvmTransactionsUtils.rehydratePendingTransactions();

    expect(
      EvmPendingTransactionsNotifications.waitForTransaction,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        hash: '0xpending',
        nonce: 5,
      }),
    );
    expect(pendingTransactionsStorage).toHaveLength(1);
  });
});
