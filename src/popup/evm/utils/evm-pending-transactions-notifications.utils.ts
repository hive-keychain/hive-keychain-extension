import { EvmUserHistoryItemType } from '@popup/evm/interfaces/evm-tokens-history.interface';
import { EvmPendingTransaction } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmTransactionResolvedStatus } from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmLocalHistoryUtils } from '@popup/evm/utils/evm-local-history.utils';
import { EvmTransactionDisplayUtils } from '@popup/evm/utils/evm-transaction-display.utils';
import { EvmTransactionsUtils } from '@popup/evm/utils/evm-transactions.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { Provider, TransactionReceipt, TransactionResponse } from 'ethers';
import { CommunicationUtils } from 'src/utils/communication.utils';
import Logger from 'src/utils/logger.utils';

import { I18nUtils } from 'src/utils/i18n.utils';
const waitForTransaction = async (transactionResponse: TransactionResponse) => {
  try {
    const transactionReceipt = await transactionResponse.wait();
    if (transactionReceipt) {
      const status =
        transactionReceipt.status === 0
          ? EvmTransactionResolvedStatus.REVERTED
          : EvmTransactionResolvedStatus.SUCCESS;
      await resolvePendingTransaction(
        transactionResponse,
        status,
        transactionReceipt,
      );
      if (status === EvmTransactionResolvedStatus.SUCCESS) {
        await createSuccessNotification(transactionResponse);
      } else {
        await createFailedNotification(transactionResponse);
      }
    }
  } catch (error: any) {
    Logger.error('Error in waitForTransaction', error);
    const status = getStatusFromWaitError(error);
    await resolvePendingTransaction(
      transactionResponse,
      status,
      error?.receipt,
      error?.shortMessage ?? error?.reason ?? error?.message,
    );
    if (error?.code !== 'TRANSACTION_REPLACED') {
      await createFailedNotification(transactionResponse);
    }
  }
};

const getStatusFromWaitError = (error: any): EvmTransactionResolvedStatus => {
  if (error?.code === 'TRANSACTION_REPLACED') {
    if (error?.reason === 'cancelled') {
      return EvmTransactionResolvedStatus.CANCELED;
    }
    if (error?.receipt?.status === 0) {
      return EvmTransactionResolvedStatus.REVERTED;
    }
    return EvmTransactionResolvedStatus.SUCCESS;
  }

  if (error?.receipt?.status === 0) {
    return EvmTransactionResolvedStatus.REVERTED;
  }

  return EvmTransactionResolvedStatus.FAILED;
};

const getChainIdHex = (transactionResponse: TransactionResponse) => {
  const chainId = transactionResponse.chainId;
  if (chainId == null) return undefined;
  const numericChainId = Number(chainId);
  if (!Number.isFinite(numericChainId)) return undefined;
  return `0x${numericChainId.toString(16)}`;
};

const resolveChainForPendingTransaction = async (
  transactionResponse: TransactionResponse,
  pendingTransaction?: EvmPendingTransaction,
): Promise<EvmChain | undefined> => {
  const chainIdCandidates = [
    pendingTransaction?.chainId,
    getChainIdHex(transactionResponse),
  ].filter((chainId): chainId is string => Boolean(chainId));

  for (const chainId of chainIdCandidates) {
    const chain = await ChainUtils.getChain<EvmChain>(chainId);
    if (chain) {
      return chain;
    }
  }

  const normalizedChainIds = new Set(
    chainIdCandidates.map((chainId) => chainId.toLowerCase()),
  );
  const customChains = await ChainUtils.getCustomChains();
  return customChains.find((chain) =>
    normalizedChainIds.has(chain.chainId.toLowerCase()),
  );
};

const serializeForMessage = (value: any): any => {
  if (value == null) return value;
  return JSON.parse(
    JSON.stringify(value, (_key, nestedValue) =>
      typeof nestedValue === 'bigint' ? nestedValue.toString() : nestedValue,
    ),
  );
};

const getTransactionResponseParams = (
  transactionResponse: TransactionResponse,
) => {
  const responseWithJson = transactionResponse as TransactionResponse & {
    toJSON?: () => any;
  };
  return serializeForMessage(
    responseWithJson.toJSON ? responseWithJson.toJSON() : transactionResponse,
  );
};

const getTransactionReceiptParams = (
  transactionReceipt?: TransactionReceipt | any,
) => {
  if (!transactionReceipt) return undefined;
  const receiptWithJson = transactionReceipt as TransactionReceipt & {
    toJSON?: () => any;
  };
  return serializeForMessage(
    receiptWithJson.toJSON ? receiptWithJson.toJSON() : transactionReceipt,
  );
};

const resolvePendingTransaction = async (
  transactionResponse: TransactionResponse,
  status: EvmTransactionResolvedStatus,
  transactionReceipt?: TransactionReceipt | any,
  errorMessage?: string,
  pendingTransactionHint?: EvmPendingTransaction,
) => {
  const chain = await resolveChainForPendingTransaction(
    transactionResponse,
    pendingTransactionHint,
  );
  const pendingTransaction =
    pendingTransactionHint ??
    (chain
      ? await EvmTransactionsUtils.getPendingTransaction(
          transactionResponse.hash,
          chain.chainId,
        )
      : undefined);
  const walletAddress =
    pendingTransaction?.walletAddress ?? transactionResponse.from;
  const displayItem = EvmTransactionDisplayUtils.buildResolvedDisplayItem(
    pendingTransaction?.displayItem ??
      (chain
        ? await EvmTransactionDisplayUtils.buildDisplayItemFromBroadcast(
            transactionResponse,
            chain,
            walletAddress,
          )
        : {
            pageTitle: 'evm_broadcast',
            type: EvmUserHistoryItemType.BASE_TRANSACTION,
            blockNumber: transactionReceipt?.blockNumber ?? 0,
            transactionHash: transactionResponse.hash,
            transactionIndex: transactionReceipt?.index ?? 0,
            timestamp: Date.now(),
            label: await I18nUtils.getMessage('evm_history_generic_message'),
            nonce: Number(transactionResponse.nonce),
          }),
    status,
    transactionReceipt,
  );

  if (chain?.isCustom) {
    await EvmLocalHistoryUtils.appendBroadcastRecord(
      chain,
      walletAddress,
      transactionResponse,
      displayItem,
    );
  }

  await sendTransactionResolvedMessage(
    transactionResponse,
    status,
    transactionReceipt,
    displayItem,
    errorMessage,
  );
  await EvmTransactionsUtils.deleteFromPendingTransactions(
    transactionResponse.hash,
  );
};

const sendTransactionResolvedMessage = async (
  transactionResponse: TransactionResponse,
  status: EvmTransactionResolvedStatus,
  transactionReceipt?: TransactionReceipt | any,
  displayItem?: any,
  errorMessage?: string,
) => {
  await CommunicationUtils.runtimeSendMessage({
    command: BackgroundCommand.EVM_TRANSACTION_RESOLVED,
    value: {
      chainId: transactionResponse.chainId?.toString(),
      from: transactionResponse.from,
      hash: transactionResponse.hash,
      status,
      transactionResponseParams: getTransactionResponseParams(
        transactionResponse,
      ),
      transactionReceiptParams: getTransactionReceiptParams(
        transactionReceipt,
      ),
      displayItem,
      errorMessage,
    },
  });
};

const createSuccessNotification = async (
  transactionResponse: TransactionResponse,
) => {
  chrome.notifications.create(
    `${transactionResponse.hash}-${transactionResponse.chainId}`,
    {
      type: 'basic',
      iconUrl: '/assets/images/iconhive.png',
      title: await I18nUtils.getMessage(
        'evm_tx_completed_notification_title',
      ),
      message: await I18nUtils.getMessage(
        'evm_tx_completed_notification_message',
        [transactionResponse.hash],
      ),
      priority: 0,
    },
  );
};

const createFailedNotification = async (
  transactionResponse: TransactionResponse,
) => {
  chrome.notifications.create(
    `${transactionResponse.hash}-${transactionResponse.chainId}`,
    {
      type: 'basic',
      iconUrl: '/assets/images/iconhive.png',
      title: await I18nUtils.getMessage('evm_tx_failed_notification_title'),
      message: await I18nUtils.getMessage(
        'evm_tx_failed_notification_message',
        [transactionResponse.hash],
      ),
      priority: 0,
    },
  );
};

const onNotificationClicked = async (notificationId: string) => {
  if (notificationId.startsWith('evm-incoming:')) {
    return;
  }
  const [hash, chainId] = notificationId.split('-');
  const chainIdHex = `0x${parseInt(chainId).toString(16)}`;
  const chain = await ChainUtils.getChain<EvmChain>(chainIdHex);
  if (!chain.blockExplorer?.url) {
    return;
  }
  chrome.tabs.create({ url: `${chain.blockExplorer.url}/tx/${hash}` });
};

chrome.notifications.onClicked.addListener(onNotificationClicked);

const finalizeConfirmedPendingTransaction = async (
  pendingTransaction: EvmPendingTransaction,
  provider: Provider,
  transactionReceipt?: TransactionReceipt | any,
): Promise<boolean> => {
  const transactionResponse = new TransactionResponse(
    pendingTransaction.txResponseParams,
    provider,
  );
  const receipt =
    transactionReceipt ??
    (await provider.getTransactionReceipt(transactionResponse.hash));

  if (!receipt) {
    return false;
  }

  const status =
    receipt.status === 0
      ? EvmTransactionResolvedStatus.REVERTED
      : EvmTransactionResolvedStatus.SUCCESS;

  await resolvePendingTransaction(
    transactionResponse,
    status,
    receipt,
    undefined,
    pendingTransaction,
  );
  return true;
};

export const EvmPendingTransactionsNotifications = {
  waitForTransaction,
  finalizeConfirmedPendingTransaction,
};
