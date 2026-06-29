import { EvmUserHistoryItemType } from '@popup/evm/interfaces/evm-tokens-history.interface';
import { EvmTransactionResolvedStatus } from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmLocalHistoryUtils } from '@popup/evm/utils/evm-local-history.utils';
import { EvmPendingTransactionsNotifications } from '@popup/evm/utils/evm-pending-transactions-notifications.utils';
import { EvmTransactionDisplayUtils } from '@popup/evm/utils/evm-transaction-display.utils';
import { EvmTransactionsUtils } from '@popup/evm/utils/evm-transactions.utils';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { CommunicationUtils } from 'src/utils/communication.utils';

import { I18nUtils } from 'src/utils/i18n.utils';

jest.mock('@popup/evm/utils/evm-transactions.utils', () => ({
  EvmTransactionsUtils: {
    getPendingTransaction: jest.fn(),
    deleteFromPendingTransactions: jest.fn(),
  },
}));

jest.mock('@popup/multichain/utils/chain.utils', () => ({
  ChainUtils: {
    getChain: jest.fn(),
  },
}));

jest.mock('@popup/evm/utils/evm-local-history.utils', () => ({
  EvmLocalHistoryUtils: {
    appendBroadcastRecord: jest.fn(),
  },
}));

jest.mock('@popup/evm/utils/evm-transaction-display.utils', () => ({
  EvmTransactionDisplayUtils: {
    buildDisplayItemFromBroadcast: jest.fn(),
    buildResolvedDisplayItem: jest.fn((item, status, receipt) => ({
      ...item,
      blockNumber: receipt?.blockNumber ?? item.blockNumber,
      isReverted: status === 'reverted' || item.isReverted,
      isFailed: status === 'failed' || item.isFailed,
      isCanceled: status === 'canceled' || item.isCanceled,
    })),
  },
}));

jest.mock('src/utils/communication.utils', () => ({
  CommunicationUtils: {
    runtimeSendMessage: jest.fn(),
  },
}));

describe('evm-pending-transactions-notifications.utils', () => {
  const chain = {
    chainId: '0x1',
    mainToken: 'ETH',
    isCustom: true,
  };
  const walletAddress = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  const displayItem = {
    pageTitle: 'evm_pending_transaction',
    type: EvmUserHistoryItemType.SMART_CONTRACT,
    blockNumber: 0,
    transactionHash: '0xhash',
    transactionIndex: 0,
    timestamp: 1,
    label: 'Pending display',
    nonce: 1,
    detailFields: [],
  };

  const buildTransactionResponse = (waitResult: Promise<any>) =>
    ({
      hash: '0xhash',
      from: walletAddress,
      nonce: 1,
      chainId: 1,
      wait: jest.fn().mockReturnValue(waitResult),
      toJSON: () => ({
        hash: '0xhash',
        from: walletAddress,
        nonce: 1,
        chainId: 1,
      }),
    }) as any;

  beforeEach(() => {
    I18nUtils.getMessage = jest.fn((key: string) => key);
    chrome.notifications.create = jest.fn();
    (ChainUtils.getChain as jest.Mock).mockResolvedValue(chain);
    (EvmTransactionsUtils.getPendingTransaction as jest.Mock).mockResolvedValue({
      walletAddress,
      displayItem,
    });
    (EvmTransactionsUtils.deleteFromPendingTransactions as jest.Mock)
      .mockResolvedValue(undefined);
    (EvmLocalHistoryUtils.appendBroadcastRecord as jest.Mock)
      .mockResolvedValue(undefined);
    (CommunicationUtils.runtimeSendMessage as jest.Mock)
      .mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('sends a success resolution payload and removes pending storage', async () => {
    const receipt = {
      hash: '0xhash',
      status: 1,
      blockNumber: 42,
      gasUsed: BigInt(21000),
      toJSON: () => ({
        hash: '0xhash',
        status: 1,
        blockNumber: 42,
        gasUsed: '21000',
      }),
    };
    const transactionResponse = buildTransactionResponse(
      Promise.resolve(receipt),
    );

    await EvmPendingTransactionsNotifications.waitForTransaction(
      transactionResponse,
    );

    expect(CommunicationUtils.runtimeSendMessage).toHaveBeenCalledWith({
      command: BackgroundCommand.EVM_TRANSACTION_RESOLVED,
      value: expect.objectContaining({
        hash: '0xhash',
        from: walletAddress,
        status: EvmTransactionResolvedStatus.SUCCESS,
        transactionReceiptParams: expect.objectContaining({
          blockNumber: 42,
        }),
        displayItem: expect.objectContaining({
          blockNumber: 42,
        }),
      }),
    });
    expect(EvmLocalHistoryUtils.appendBroadcastRecord).toHaveBeenCalledWith(
      chain,
      walletAddress,
      transactionResponse,
      expect.objectContaining({ blockNumber: 42 }),
    );
    expect(
      EvmTransactionsUtils.deleteFromPendingTransactions,
    ).toHaveBeenCalledWith('0xhash');
    expect(chrome.notifications.create).toHaveBeenCalledWith(
      '0xhash-1',
      expect.objectContaining({
        title: 'evm_tx_completed_notification_title',
      }),
    );
  });

  it('sends a failed resolution payload and failed notification on wait error', async () => {
    const transactionResponse = buildTransactionResponse(
      Promise.reject(new Error('network down')),
    );

    await EvmPendingTransactionsNotifications.waitForTransaction(
      transactionResponse,
    );

    expect(CommunicationUtils.runtimeSendMessage).toHaveBeenCalledWith({
      command: BackgroundCommand.EVM_TRANSACTION_RESOLVED,
      value: expect.objectContaining({
        hash: '0xhash',
        status: EvmTransactionResolvedStatus.FAILED,
        errorMessage: 'network down',
      }),
    });
    expect(
      EvmTransactionsUtils.deleteFromPendingTransactions,
    ).toHaveBeenCalledWith('0xhash');
    expect(chrome.notifications.create).toHaveBeenCalledWith(
      '0xhash-1',
      expect.objectContaining({
        title: 'evm_tx_failed_notification_title',
      }),
    );
  });

  it('resolves canceled replacements without creating a failure notification', async () => {
    const transactionResponse = buildTransactionResponse(
      Promise.reject({
        code: 'TRANSACTION_REPLACED',
        reason: 'cancelled',
      }),
    );

    await EvmPendingTransactionsNotifications.waitForTransaction(
      transactionResponse,
    );

    expect(CommunicationUtils.runtimeSendMessage).toHaveBeenCalledWith({
      command: BackgroundCommand.EVM_TRANSACTION_RESOLVED,
      value: expect.objectContaining({
        hash: '0xhash',
        status: EvmTransactionResolvedStatus.CANCELED,
      }),
    });
    expect(
      EvmTransactionsUtils.deleteFromPendingTransactions,
    ).toHaveBeenCalledWith('0xhash');
    expect(chrome.notifications.create).not.toHaveBeenCalled();
    expect(
      EvmTransactionDisplayUtils.buildResolvedDisplayItem,
    ).toHaveBeenCalledWith(
      displayItem,
      EvmTransactionResolvedStatus.CANCELED,
      undefined,
    );
  });
});
