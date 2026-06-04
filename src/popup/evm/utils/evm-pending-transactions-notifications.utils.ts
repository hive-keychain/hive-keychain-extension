import { EvmTransactionsUtils } from '@popup/evm/utils/evm-transactions.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { TransactionResponse } from 'ethers';
import { CommunicationUtils } from 'src/utils/communication.utils';
import Logger from 'src/utils/logger.utils';

import { I18nUtils } from 'src/utils/i18n.utils';
const waitForTransaction = async (transactionResponse: TransactionResponse) => {
  try {
    const transactionReceipt = await transactionResponse.wait();
    if (transactionReceipt) {
      await EvmTransactionsUtils.deleteFromPendingTransactions(
        transactionReceipt.hash,
      );
      await sendTransactionResolvedMessage(transactionResponse);
      await createSuccessNotification(transactionResponse);
    }
  } catch (error: any) {
    Logger.error('Error in waitForTransaction', error);
    await EvmTransactionsUtils.deleteFromPendingTransactions(
      transactionResponse.hash,
    );
    if (error?.code !== 'TRANSACTION_REPLACED') {
      await createFailedNotification(transactionResponse);
      return;
    }
  }
};

const sendTransactionResolvedMessage = async (
  transactionResponse: TransactionResponse,
) => {
  await CommunicationUtils.runtimeSendMessage({
    command: BackgroundCommand.EVM_TRANSACTION_RESOLVED,
    value: {
      chainId: transactionResponse.chainId?.toString(),
      from: transactionResponse.from,
      hash: transactionResponse.hash,
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
  const [hash, chainId] = notificationId.split('-');
  const chainIdHex = `0x${parseInt(chainId).toString(16)}`;
  const chain = await ChainUtils.getChain<EvmChain>(chainIdHex);
  if (!chain.blockExplorer?.url) {
    return;
  }
  chrome.tabs.create({ url: `${chain.blockExplorer.url}/tx/${hash}` });
};

chrome.notifications.onClicked.addListener(onNotificationClicked);
export const EvmPendingTransactionsNotifications = {
  waitForTransaction,
};
