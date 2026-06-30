import { EvmUserHistoryItemType } from '@popup/evm/interfaces/evm-tokens-history.interface';
import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { GasFeeEstimationBase } from '@popup/evm/interfaces/gas-fee.interface';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmPendingTransactionsNotifications } from '@popup/evm/utils/evm-pending-transactions-notifications.utils';
import { EvmSignerUtils } from '@popup/evm/utils/evm-signer.utils';
import { EvmTransactionsUtils } from '@popup/evm/utils/evm-transactions.utils';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import Decimal from 'decimal.js';
import LocalStorageUtils from 'src/utils/localStorage.utils';

import { I18nUtils } from 'src/utils/i18n.utils';
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
  const pendingDisplayItem = {
    pageTitle: 'evm_pending_transaction',
    type: EvmUserHistoryItemType.SMART_CONTRACT,
    blockNumber: 0,
    transactionHash: '0xblocking',
    transactionIndex: 0,
    timestamp: 1,
    label: 'Pending swap',
    nonce: 0,
    detailFields: [],
  };

  let pendingTransactionsStorage: any[];
  let provider: {
    getTransactionCount: jest.Mock;
    getTransactionReceipt: jest.Mock;
    getTransaction: jest.Mock;
  };

  const buildGasFee = (
    type: EvmTransactionType,
    overrides: Partial<GasFeeEstimationBase> = {},
  ): GasFeeEstimationBase => ({
    type,
    estimatedFeeInEth: new Decimal('0.001'),
    estimatedFeeUSD: new Decimal(1),
    maxFeeInEth: new Decimal('0.002'),
    maxFeeUSD: new Decimal(2),
    estimatedMaxDuration: new Decimal(30),
    gasLimit: new Decimal(21000),
    priorityFeeInGwei: new Decimal(1),
    maxFeePerGasInGwei: new Decimal(30),
    gasPriceInGwei: new Decimal(25),
    icon: 'EVM_GAS_FEE_LOW' as any,
    name: 'popup_html_evm_custom_gas_fee_low',
    ...overrides,
  });

  beforeEach(() => {
    pendingTransactionsStorage = [];
    provider = {
      getTransactionCount: jest.fn(),
      getTransactionReceipt: jest.fn().mockResolvedValue(null),
      getTransaction: jest.fn().mockResolvedValue(null),
    };

    I18nUtils.getMessage = jest.fn((key: string) => key);

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
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uses the blocking pending nonce when resolving pending transaction details', async () => {
    pendingTransactionsStorage = [
      {
        txResponseParams: {
          hash: '0xblocking',
          nonce: 0,
          chainId: chain.chainId,
        },
        walletAddress,
        chainId: chain.chainId,
        broadcastDate: 1,
        displayItem: pendingDisplayItem,
      },
      {
        txResponseParams: {
          hash: '0xqueued',
          nonce: 1,
          chainId: chain.chainId,
        },
        walletAddress,
        chainId: chain.chainId,
        broadcastDate: 2,
      },
    ];

    provider.getTransactionCount.mockImplementation(
      (_addr: string, tag: string) =>
        Promise.resolve(tag === 'pending' ? 2 : 0),
    );

    const result = await EvmTransactionsUtils.hasPendingTransaction(
      walletAddress,
      chain,
    );

    expect(result).toMatchObject({
      hasPending: true,
      pendingTransactionsCount: 1,
      queuedTransactionsCount: 1,
      pendingTransactionDetails: {
        label: 'Pending swap',
        title: 'evm_pending_queued_transactions',
        nonce: 0,
        displayItem: pendingDisplayItem,
      },
    });
    expect(result?.pendingTransactionDetails.transactionResponse).toMatchObject(
      {
        hash: '0xblocking',
        nonce: 0,
      },
    );
  });

  it('builds a fallback display item for old pending records without one', async () => {
    pendingTransactionsStorage = [
      {
        txResponseParams: {
          hash: '0xqueued',
          nonce: 0,
          chainId: chain.chainId,
        },
        walletAddress,
        chainId: chain.chainId,
        broadcastDate: 2,
      },
    ];

    provider.getTransactionCount.mockResolvedValue(0);
    provider.getTransactionReceipt.mockResolvedValue(null);
    provider.getTransaction.mockResolvedValue(null);

    const result = await EvmTransactionsUtils.hasPendingTransaction(
      walletAddress,
      chain,
    );

    expect(result?.pendingTransactionDetails).toMatchObject({
      label: 'evm_history_smart_contract_creation_message_no_address',
      title: 'evm_one_pending_transaction',
      nonce: 0,
      displayItem: {
        transactionHash: '0xqueued',
      },
    });
  });

  it('uses the pending-only title when there are no queued transactions', async () => {
    pendingTransactionsStorage = [
      {
        txResponseParams: {
          hash: '0xblocking',
          nonce: 0,
          chainId: chain.chainId,
        },
        walletAddress,
        chainId: chain.chainId,
        broadcastDate: 1,
        displayItem: pendingDisplayItem,
      },
    ];

    provider.getTransactionCount.mockImplementation(
      (_addr: string, tag: string) =>
        Promise.resolve(tag === 'pending' ? 1 : 0),
    );

    const result = await EvmTransactionsUtils.hasPendingTransaction(
      walletAddress,
      chain,
    );

    expect(result).toMatchObject({
      hasPending: true,
      pendingTransactionsCount: 1,
      queuedTransactionsCount: 0,
      pendingTransactionDetails: {
        label: 'Pending swap',
        title: 'evm_one_pending_transaction',
        nonce: 0,
        displayItem: pendingDisplayItem,
      },
    });
  });

  it('trusts local pending storage when RPC nonces are equal and getTransaction is null', async () => {
    pendingTransactionsStorage = [
      {
        txResponseParams: { hash: '0xlocal', nonce: 0, chainId: chain.chainId },
        walletAddress,
        chainId: chain.chainId,
        broadcastDate: 1,
        displayItem: pendingDisplayItem,
      },
    ];

    provider.getTransactionCount.mockResolvedValue(0);
    provider.getTransactionReceipt.mockResolvedValue(null);
    provider.getTransaction.mockResolvedValue(null);

    const result = await EvmTransactionsUtils.hasPendingTransaction(
      walletAddress,
      chain,
    );

    expect(result).toMatchObject({
      hasPending: true,
      pendingTransactionsCount: 1,
      queuedTransactionsCount: 0,
      pendingTransactionDetails: {
        label: 'Pending swap',
        title: 'evm_one_pending_transaction',
        nonce: 0,
      },
    });
  });

  it('does not report pending when local storage exists but receipt is confirmed', async () => {
    pendingTransactionsStorage = [
      {
        txResponseParams: {
          hash: '0xconfirmed',
          nonce: 0,
          chainId: chain.chainId,
        },
        walletAddress,
        chainId: chain.chainId,
        broadcastDate: 1,
        displayItem: pendingDisplayItem,
      },
    ];

    provider.getTransactionCount.mockResolvedValue(0);
    provider.getTransactionReceipt.mockResolvedValue({ hash: '0xconfirmed' });
    const finalizeSpy = jest
      .spyOn(
        EvmPendingTransactionsNotifications,
        'finalizeConfirmedPendingTransaction',
      )
      .mockResolvedValue(true);

    const result = await EvmTransactionsUtils.hasPendingTransaction(
      walletAddress,
      chain,
    );

    expect(result?.hasPending).toBe(false);
    expect(finalizeSpy).toHaveBeenCalled();
    expect(pendingTransactionsStorage).toEqual([]);
  });

  it('does not report pending when local storage nonce is behind latestNonce', async () => {
    pendingTransactionsStorage = [
      {
        txResponseParams: { hash: '0xstale1', nonce: 1, chainId: chain.chainId },
        walletAddress,
        chainId: chain.chainId,
        broadcastDate: 1,
      },
      {
        txResponseParams: { hash: '0xstale2', nonce: 2, chainId: chain.chainId },
        walletAddress,
        chainId: chain.chainId,
        broadcastDate: 2,
      },
      {
        txResponseParams: { hash: '0xstale3', nonce: 3, chainId: chain.chainId },
        walletAddress,
        chainId: chain.chainId,
        broadcastDate: 3,
      },
      {
        txResponseParams: { hash: '0xstale4', nonce: 4, chainId: chain.chainId },
        walletAddress,
        chainId: chain.chainId,
        broadcastDate: 4,
      },
    ];

    provider.getTransactionCount.mockResolvedValue(5);
    provider.getTransactionReceipt.mockResolvedValue(null);
    provider.getTransaction.mockResolvedValue(null);
    jest
      .spyOn(
        EvmPendingTransactionsNotifications,
        'finalizeConfirmedPendingTransaction',
      )
      .mockResolvedValue(false);

    const result = await EvmTransactionsUtils.hasPendingTransaction(
      walletAddress,
      chain,
    );

    expect(result?.hasPending).toBe(false);
    expect(result?.queuedTransactionsCount).toBe(0);
    expect(pendingTransactionsStorage).toEqual([]);
  });

  it('does not report pending when local storage exists but getTransaction is mined', async () => {
    pendingTransactionsStorage = [
      {
        txResponseParams: { hash: '0xmined', nonce: 0, chainId: chain.chainId },
        walletAddress,
        chainId: chain.chainId,
        broadcastDate: 1,
        displayItem: pendingDisplayItem,
      },
    ];

    provider.getTransactionCount.mockResolvedValue(0);
    provider.getTransactionReceipt.mockResolvedValue(null);
    provider.getTransaction.mockResolvedValue({
      hash: '0xmined',
      blockNumber: 123,
      blockHash: '0xabc',
    });
    const finalizeSpy = jest
      .spyOn(
        EvmPendingTransactionsNotifications,
        'finalizeConfirmedPendingTransaction',
      )
      .mockResolvedValue(true);

    const result = await EvmTransactionsUtils.hasPendingTransaction(
      walletAddress,
      chain,
    );

    expect(result?.hasPending).toBe(false);
    expect(finalizeSpy).toHaveBeenCalled();
    expect(pendingTransactionsStorage).toEqual([]);
  });

  it('does not write local history when sending on a custom chain', async () => {
    const customChain = { ...chain, chainId: '0x39', isCustom: true };
    let localHistoryStorage: unknown;

    jest.spyOn(ChainUtils, 'getChain').mockResolvedValue(customChain);
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation(async (key) => {
        if (key === LocalStorageKeyEnum.EVM_PENDING_TRANSACTIONS) {
          return pendingTransactionsStorage;
        }
        if (key === LocalStorageKeyEnum.EVM_LOCAL_HISTORY) {
          return localHistoryStorage;
        }
        return undefined;
      });
    jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockImplementation(async (key, value) => {
        if (key === LocalStorageKeyEnum.EVM_PENDING_TRANSACTIONS) {
          pendingTransactionsStorage = value;
        }
        if (key === LocalStorageKeyEnum.EVM_LOCAL_HISTORY) {
          localHistoryStorage = value;
        }
      });

    provider.getTransactionCount.mockResolvedValue(0);
    jest.spyOn(EvmSignerUtils, 'sendTransaction').mockResolvedValue({
      hash: '0xcustom',
      nonce: 0,
      chainId: customChain.chainId,
      from: walletAddress,
      to: '0x0000000000000000000000000000000000000001',
      value: BigInt(1),
      data: '0x',
      blockNumber: null,
      index: null,
      toJSON: () => ({
        hash: '0xcustom',
        nonce: 0,
        chainId: customChain.chainId,
      }),
    } as any);

    await EvmTransactionsUtils.send(
      { address: walletAddress } as any,
      {
        to: '0x0000000000000000000000000000000000000001',
        value: '0x1',
        data: '',
        type: Number(EvmTransactionType.EIP_1559),
      },
      buildGasFee(EvmTransactionType.EIP_1559),
      customChain.chainId,
    );

    expect(pendingTransactionsStorage).toHaveLength(1);
    expect(localHistoryStorage).toBeUndefined();
  });

  it('removes already confirmed transactions during rehydration', async () => {
    pendingTransactionsStorage = [
      {
        txResponseParams: {
          hash: '0xconfirmed',
          nonce: 5,
          chainId: chain.chainId,
        },
        walletAddress,
        chainId: chain.chainId,
        broadcastDate: 1,
      },
    ];
    provider.getTransactionReceipt.mockResolvedValue({
      hash: '0xconfirmed',
      status: 1,
      blockNumber: 42,
    });
    const finalizeSpy = jest
      .spyOn(
        EvmPendingTransactionsNotifications,
        'finalizeConfirmedPendingTransaction',
      )
      .mockResolvedValue(true);

    await EvmTransactionsUtils.rehydratePendingTransactions();

    expect(finalizeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        txResponseParams: expect.objectContaining({ hash: '0xconfirmed' }),
      }),
      provider,
      expect.objectContaining({ hash: '0xconfirmed' }),
    );
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
    const finalizeSpy = jest
      .spyOn(
        EvmPendingTransactionsNotifications,
        'finalizeConfirmedPendingTransaction',
      )
      .mockResolvedValue(false);

    await EvmTransactionsUtils.rehydratePendingTransactions();

    expect(finalizeSpy).toHaveBeenCalled();
    expect(pendingTransactionsStorage).toEqual([]);
    expect(
      EvmPendingTransactionsNotifications.waitForTransaction,
    ).not.toHaveBeenCalled();
  });

  it('restarts waiting for transactions that are still pending during rehydration', async () => {
    pendingTransactionsStorage = [
      {
        txResponseParams: {
          hash: '0xpending',
          nonce: 5,
          chainId: chain.chainId,
        },
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

  it('stores a display item when adding a sent transaction to pending storage', async () => {
    provider.getTransactionCount.mockResolvedValue(0);
    jest.spyOn(EvmSignerUtils, 'sendTransaction').mockResolvedValue({
      hash: '0xdisplay',
      nonce: 0,
      chainId: chain.chainId,
      from: walletAddress,
      to: '0x0000000000000000000000000000000000000001',
      value: BigInt(1),
      data: '0x',
      blockNumber: null,
      index: null,
      toJSON: () => ({
        hash: '0xdisplay',
        nonce: 0,
        chainId: chain.chainId,
      }),
    } as any);

    await EvmTransactionsUtils.send(
      { address: walletAddress } as any,
      {
        to: '0x0000000000000000000000000000000000000001',
        value: '0x1',
        data: '',
        type: Number(EvmTransactionType.EIP_1559),
      },
      buildGasFee(EvmTransactionType.EIP_1559),
      chain.chainId,
    );

    expect(pendingTransactionsStorage[0]).toMatchObject({
      txResponseParams: {
        hash: '0xdisplay',
      },
      displayItem: {
        transactionHash: '0xdisplay',
        type: EvmUserHistoryItemType.TRANSFER_OUT,
      },
    });
  });

  it('broadcasts legacy selected gas fees as legacy transaction requests', async () => {
    provider.getTransactionCount.mockResolvedValue(0);
    const sendTransactionSpy = jest
      .spyOn(EvmSignerUtils, 'sendTransaction')
      .mockResolvedValue({
        hash: '0xlegacy',
        nonce: 0,
        chainId: chain.chainId,
        toJSON: () => ({
          hash: '0xlegacy',
          nonce: 0,
          chainId: chain.chainId,
        }),
      } as any);

    await EvmTransactionsUtils.send(
      { address: walletAddress } as any,
      {
        to: '0x0000000000000000000000000000000000000001',
        value: '0x0',
        data: '',
        type: Number(EvmTransactionType.EIP_1559),
      },
      buildGasFee(EvmTransactionType.LEGACY, {
        gasPriceInGwei: new Decimal('0.0000000162'),
      }),
      chain.chainId,
    );

    const transactionRequest = sendTransactionSpy.mock.calls[0][1];
    expect(transactionRequest.type).toBe(Number(EvmTransactionType.LEGACY));
    expect(transactionRequest.data).toBe('0x');
    expect(transactionRequest.gasPrice).toBe(BigInt('17'));
    expect(transactionRequest.maxFeePerGas).toBeUndefined();
    expect(transactionRequest.maxPriorityFeePerGas).toBeUndefined();
  });

  it('broadcasts EIP-1559 selected gas fees as EIP-1559 transaction requests', async () => {
    provider.getTransactionCount.mockResolvedValue(0);
    const sendTransactionSpy = jest
      .spyOn(EvmSignerUtils, 'sendTransaction')
      .mockResolvedValue({
        hash: '0xeip1559',
        nonce: 0,
        chainId: chain.chainId,
        toJSON: () => ({
          hash: '0xeip1559',
          nonce: 0,
          chainId: chain.chainId,
        }),
      } as any);

    await EvmTransactionsUtils.send(
      { address: walletAddress } as any,
      {
        to: '0x0000000000000000000000000000000000000001',
        value: '0x0',
        data: '0x',
        type: Number(EvmTransactionType.LEGACY),
      },
      buildGasFee(EvmTransactionType.EIP_1559),
      chain.chainId,
    );

    const transactionRequest = sendTransactionSpy.mock.calls[0][1];
    expect(transactionRequest.type).toBe(Number(EvmTransactionType.EIP_1559));
    expect(transactionRequest.maxPriorityFeePerGas).toBe(BigInt('1000000000'));
    expect(transactionRequest.maxFeePerGas).toBe(BigInt('30000000000'));
    expect(transactionRequest.gasPrice).toBeUndefined();
  });
});
