import { EvmTransactionsUtils } from '@popup/evm/utils/evm-transactions.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { TransactionResponse } from 'ethers';

const waitForTransaction = async (transactionResponse: TransactionResponse) => {
  const transactionReceipt = await transactionResponse.wait();
  console.log(transactionReceipt);
  if (transactionReceipt) {
    EvmTransactionsUtils.deleteFromPendingTransactions(transactionReceipt.hash);
    createNotification(transactionResponse);
  }
};

const createNotification = async (transactionResponse: TransactionResponse) => {
  chrome.notifications.create(
    `${transactionResponse.hash}-${transactionResponse.chainId}`,
    {
      type: 'basic',
      iconUrl: '/assets/images/iconhive.png',
      title: await chrome.i18n.getMessage(
        'evm_tx_completed_notification_title',
      ),
      message: await chrome.i18n.getMessage(
        'evm_tx_completed_notification_message',
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
  chrome.tabs.create({ url: `${chain.blockExplorer?.url}/tx/${hash}` });
};

chrome.notifications.onClicked.addListener(onNotificationClicked);
export const EvmPendingTransactionsNotifications = {
  waitForTransaction,
};
