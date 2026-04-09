import { EvmActiveAccount } from '@popup/evm/interfaces/active-account.interface';
import {
  EvmPendingTransaction,
  EvmSmartContractInfo,
} from '@popup/evm/interfaces/evm-tokens.interface';
import {
  CanceledTransactionData,
  EvmPendingTransactionDetails,
  EvmTransactionType,
  UserCanceledTransactions,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { GasFeeEstimationBase } from '@popup/evm/interfaces/gas-fee.interface';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmPendingTransactionsNotifications } from '@popup/evm/utils/evm-pending-transactions-notifications.utils';
import { EvmRequestsUtils } from '@popup/evm/utils/evm-requests.utils';
import { EvmTokensHistoryParserUtils } from '@popup/evm/utils/evm-tokens-history-parser.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { ContextType } from '@reference-data/context-type.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import Decimal from 'decimal.js';
import {
  ethers,
  HDNodeWallet,
  TransactionRequest,
  TransactionResponse,
  Wallet,
} from 'ethers';
import { CommunicationUtils } from 'src/utils/communication.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

const normalizePendingTransactions = (
  transactions: unknown,
): EvmPendingTransaction[] => {
  return Array.isArray(transactions) ? transactions : [];
};

const getPendingTransactionNonce = (transaction: EvmPendingTransaction) =>
  Number(transaction.txResponseParams.nonce);

const persistPendingTransactions = async (
  transactions: EvmPendingTransaction[],
) => {
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_PENDING_TRANSACTIONS,
    transactions,
  );
};

const trackPendingTransactionConfirmation = async (
  transactionResponse: TransactionResponse,
  chain: EvmChain,
) => {
  switch ((global as any).contextType) {
    case ContextType.POPUP: {
      await CommunicationUtils.runtimeSendMessage({
        command: BackgroundCommand.WAIT_FOR_EVM_TRANSACTION_CONFIRMATION,
        value: { transactionResponse, chain },
      });
      break;
    }
    case ContextType.SERVICE_WORKER: {
      void EvmPendingTransactionsNotifications.waitForTransaction(
        transactionResponse,
      );
      break;
    }
  }
};

const send = async (
  wallet: HDNodeWallet,
  request: Partial<TransactionRequest>,
  gasFee: GasFeeEstimationBase,
  chainId: string,
  forceNounce?: number,
) => {
  const chain = await ChainUtils.getChain<EvmChain>(chainId);
  let feeData = {};
  if (gasFee)
    switch (gasFee.type) {
      case EvmTransactionType.EIP_1559: {
        feeData = {
          maxPriorityFeePerGas: ethers.parseUnits(
            gasFee.priorityFeeInGwei!.toFixed(),
            'gwei',
          ),
          maxFeePerGas: ethers.parseUnits(
            gasFee.maxFeePerGasInGwei!.toFixed(),
            'gwei',
          ),
        };
        break;
      }
      case EvmTransactionType.EIP_155:
      case EvmTransactionType.LEGACY: {
        feeData = {
          gasPrice: ethers.parseUnits(
            new Decimal(gasFee.gasPriceInGwei!).toFixed(),
            'gwei',
          ),
        };
        break;
      }
    }

  let transactionRequest: TransactionRequest;
  transactionRequest = {
    value: request.value ?? '0x0',
    data: request.data,
    to: request.to,
    from: wallet.address,
    nonce: forceNounce ?? (await EvmRequestsUtils.getNonce(wallet, chain)),
    gasLimit: gasFee ? BigInt(gasFee.gasLimit.toFixed(0)) : null,
    chainId: chain.chainId,
    type: request.type,
    ...feeData,
  };

  console.log(transactionRequest, 'transactionRequest');

  if (
    request.type &&
    (request.type as unknown as EvmTransactionType) ===
      EvmTransactionType.EIP_155
  ) {
    if (request.accessList) {
      transactionRequest.accessList = request.accessList;
    }
  }

  const provider = await EthersUtils.getProvider(chain as EvmChain);
  const connectedWallet = new Wallet(wallet.signingKey, provider);

  const transactionResponse: TransactionResponse = await connectedWallet
    .sendTransaction(transactionRequest)
    .catch((err) => {
      Logger.error('Error in send', err);
      throw err;
    })
    .then((transaction) => transaction);
  if (transactionResponse) {
    await addPendingTransaction(
      connectedWallet.address,
      transactionResponse,
      chain,
    );
  }
  return transactionResponse;
};

const cancel = async (
  activeAccount: EvmActiveAccount,
  nounce: number,
  gasFee: any,
  chainId: string,
  transactionResponse: TransactionResponse,
) => {
  // addCanceledTransaction()

  // TODO add cancel transaction to history

  return await send(
    activeAccount.wallet,
    {
      to: ethers.ZeroAddress,
      value: 0,
      data: ethers.ZeroHash,
      from: activeAccount.wallet.address,
      nonce: nounce,
      chainId: chainId,
    },
    gasFee,
    chainId,
    nounce,
  );
};

const addPendingTransaction = async (
  walletAddress: string,
  transactionResponse: TransactionResponse,
  chain: EvmChain,
) => {
  let transactions = await getAllPendingTransactions();

  transactions.push({
    txResponseParams: transactionResponse.toJSON(),
    walletAddress: walletAddress,
    chainId: chain.chainId,
    broadcastDate: Date.now(),
  });

  await persistPendingTransactions(transactions);
  await trackPendingTransactionConfirmation(transactionResponse, chain);
};

const deleteFromPendingTransactions = async (txHash: string) => {
  let transactions = await getAllPendingTransactions();
  transactions = transactions.filter(
    (transaction: EvmPendingTransaction) =>
      transaction.txResponseParams.hash.toLowerCase() !== txHash.toLowerCase(),
  );
  await persistPendingTransactions(transactions);
};

const hasPendingTransaction = async (wallet: HDNodeWallet, chain: EvmChain) => {
  try {
    const pendingNonce = await EvmRequestsUtils.getNonce(
      wallet,
      chain,
      'pending',
    );
    const latestNonce = await EvmRequestsUtils.getNonce(
      wallet,
      chain,
      'latest',
    );

    const hasPending = pendingNonce > latestNonce;
    return {
      hasPending,
      pendingTransactionsCount: hasPending ? 1 : 0,
      queuedTransactionsCount: hasPending ? pendingNonce - latestNonce - 1 : 0,
      pendingTransactionDetails: await getPendingTransactionsDetails(
        wallet.address,
        chain,
        hasPending ? latestNonce : undefined,
      ),
    };
  } catch (error) {
    Logger.error('Error in hasPendingTransaction', error);
  }
};

const getAllPendingTransactions = async () => {
  const transactions =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_PENDING_TRANSACTIONS,
    );
  return normalizePendingTransactions(transactions);
};

const getPendingTransactionsForWallet = async (
  walletAddress: string,
  chainId: EvmChain['chainId'],
) => {
  let transactions = await getAllPendingTransactions();
  return transactions.filter(
    (transaction) =>
      transaction.walletAddress.toLowerCase() === walletAddress.toLowerCase() &&
      transaction.chainId === chainId,
  );
};

const getPendingTransactionsDetails = async (
  walletAddress: string,
  chain: EvmChain,
  nonce?: number,
): Promise<EvmPendingTransactionDetails> => {
  let pendingTransactionDetail: EvmPendingTransactionDetails = {
    label: chrome.i18n.getMessage('evm_unknown_pending_transaction'),
    title: 'evm_pending_queued_transactions',
    nonce: nonce,
  };

  let pendingTx: any;

  const provider = await EthersUtils.getProvider(chain);
  const localPendingTransactions = await getPendingTransactionsForWallet(
    walletAddress,
    chain.chainId,
  );

  if (nonce !== undefined) {
    const tx = localPendingTransactions.find(
      (transaction) => getPendingTransactionNonce(transaction) === nonce,
    );
    if (tx) pendingTx = new TransactionResponse(tx?.txResponseParams, provider);
  }

  if (pendingTx) {
    const item = await EvmTokensHistoryParserUtils.parseEvent(
      pendingTx,
      chain,
      walletAddress.toLowerCase(),
      undefined,
      true,
    );

    pendingTransactionDetail = {
      label:
        item?.label ??
        chrome.i18n.getMessage('evm_unknown_pending_transaction'),
      title: 'evm_pending_queued_transactions',
      transactionResponse: pendingTx,
      nonce: pendingTx.nonce,
    };
  }

  return pendingTransactionDetail;
};

const getPendingTransaction = async (
  txHash: string,
  chainId: EvmChain['chainId'],
) => {
  let transactions = await getAllPendingTransactions();
  return transactions.find(
    (transaction: EvmPendingTransaction) =>
      transaction.txResponseParams.hash.toLowerCase() ===
        txHash.toLowerCase() && transaction.chainId === chainId,
  );
};

const getHighestNonceInPendingTransaction = async (
  chainId: string,
  walletAddress: string,
) => {
  const transactions = await getPendingTransactionsForWallet(
    walletAddress,
    chainId,
  );

  return transactions.length > 0
    ? Math.max(...transactions.map((pendingTx) => getPendingTransactionNonce(pendingTx)))
    : 0;
};

const getCanceledTransactions = async (
  chain: EvmChain,
  address: string,
  tokenInfo: EvmSmartContractInfo,
): Promise<CanceledTransactionData[]> => {
  const data = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_CANCELED_TRANSACTIONS,
  );

  if (!data) return [];
  if (!data[chain.chainId]) return [];
  if (!data[chain.chainId][address]) return [];
  return data[chain.chainId][address].filter(
    (canceledTransactions: CanceledTransactionData) =>
      canceledTransactions.tokenInfo.symbol === tokenInfo.symbol &&
      canceledTransactions.tokenInfo.coingeckoId === tokenInfo.coingeckoId,
  );
};

const getAllCanceledTransactions = async (
  chain: EvmChain,
  address: string,
): Promise<CanceledTransactionData[]> => {
  const data = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_CANCELED_TRANSACTIONS,
  );
  if (!data) return [];
  if (!data[chain.chainId]) return [];
  return data[chain.chainId][address] ?? [];
};

const addCanceledTransaction = async (
  transactionResponse: TransactionResponse,
  address: string,
  tokenInfo: EvmSmartContractInfo,
  amount: number,
  receiverAddress: string,
  chain: EvmChain,
) => {
  let transactions: UserCanceledTransactions =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_CANCELED_TRANSACTIONS,
    );
  if (!transactions) {
    transactions = {};
  }
  if (!transactions[chain.chainId]) {
    transactions[chain.chainId] = {};
  }
  if (!transactions[chain.chainId][address]) {
    transactions[chain.chainId][address] = [];
  }
  transactions[chain.chainId][address].push({
    nonce: transactionResponse.nonce,
    amount,
    tokenInfo,
    from: address,
    to: receiverAddress,
  });

  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_CANCELED_TRANSACTIONS,
    transactions,
  );
};

const rehydratePendingTransactions = async () => {
  const pendingTransactions = await getAllPendingTransactions();

  for (const pendingTransaction of pendingTransactions) {
    try {
      const chain = await ChainUtils.getChain<EvmChain>(pendingTransaction.chainId);
      const provider = await EthersUtils.getProvider(chain);
      const transactionResponse = new TransactionResponse(
        pendingTransaction.txResponseParams,
        provider,
      );

      const transactionReceipt = await provider.getTransactionReceipt(
        transactionResponse.hash,
      );
      if (transactionReceipt) {
        await deleteFromPendingTransactions(transactionReceipt.hash);
        continue;
      }

      const latestNonce = await provider.getTransactionCount(
        pendingTransaction.walletAddress,
        'latest',
      );
      if (latestNonce > getPendingTransactionNonce(pendingTransaction)) {
        await deleteFromPendingTransactions(transactionResponse.hash);
        continue;
      }

      void EvmPendingTransactionsNotifications.waitForTransaction(
        transactionResponse,
      );
    } catch (error) {
      Logger.error('Error in rehydratePendingTransactions', error);
    }
  }
};

export const EvmTransactionsUtils = {
  cancel,
  getHighestNonceInPendingTransaction,
  getPendingTransaction,
  getAllPendingTransactions,
  getPendingTransactionsForWallet,
  addPendingTransaction,
  deleteFromPendingTransactions,
  getCanceledTransactions,
  addCanceledTransaction,
  getAllCanceledTransactions,
  send,
  hasPendingTransaction,
  getPendingTransactionsDetails,
  rehydratePendingTransactions,
};
