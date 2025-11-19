import { BlockscoutApi } from '@popup/evm/api/blockscout.api';
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
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import {
  BlockExplorerType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import Decimal from 'decimal.js';
import {
  ethers,
  HDNodeWallet,
  TransactionRequest,
  TransactionResponse,
  Wallet,
} from 'ethers';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const send = async (
  wallet: HDNodeWallet,
  request: Partial<TransactionRequest>,
  gasFee: GasFeeEstimationBase,
  chainId: string,
  forceNounce?: number,
) => {
  const chain = await ChainUtils.getChain<EvmChain>(chainId);
  let feeData = {};
  console.log(gasFee, 'gasFee in send');
  console.log(gasFee.maxFeePerGas?.toFixed());
  console.log(gasFee.priorityFee?.toFixed());
  if (gasFee)
    switch (gasFee.type) {
      case EvmTransactionType.EIP_1559: {
        feeData = {
          maxPriorityFeePerGas: ethers.parseUnits(
            gasFee.priorityFee!.toFixed(),
            'gwei',
          ),
          maxFeePerGas: ethers.parseUnits(
            gasFee.maxFeePerGas!.toFixed(),
            'gwei',
          ),
        };
        break;
      }
      case EvmTransactionType.EIP_155:
      case EvmTransactionType.LEGACY: {
        feeData = {
          gasPrice: ethers.parseUnits(
            new Decimal(gasFee.gasPrice!).toFixed(),
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

  console.log(transactionRequest, 'transactionRequest in send');

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
      console.log('Error in send', err);
      throw err;
    })
    .then((transaction) => transaction);
  if (transactionResponse) {
    addPendingTransaction(
      connectedWallet.address,
      transactionResponse,
      chain.chainId,
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
  chainId: EvmChain['chainId'],
) => {
  let transactions = await getAllPendingTransactions();

  transactions.push({
    txResponseParams: transactionResponse.toJSON(),
    walletAddress: walletAddress,
    chainId: chainId,
    broadcastDate: Date.now(),
  });

  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_PENDING_TRANSACTIONS,
    transactions,
  );

  EvmPendingTransactionsNotifications.waitForTransaction(transactionResponse);
};

const deleteFromPendingTransactions = async (txHash: string) => {
  let transactions = await getAllPendingTransactions();
  transactions = transactions.filter(
    (transaction: EvmPendingTransaction) =>
      transaction.txResponseParams.hash.toLowerCase() !== txHash.toLowerCase(),
  );
  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_PENDING_TRANSACTIONS,
    transactions,
  );
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
    console.log({
      pendingNonce,
      latestNonce,
      pendingTransactionCount: hasPending ? 1 : 0,
      queuedTransactionsCount: pendingNonce - latestNonce - 1,
      pendingTransactionDetails: await getPendingTransactionsForWallet2(
        wallet.address,
        chain,
      ),
    });
    return {
      hasPending,
      pendingTransactionsCount: hasPending ? 1 : 0,
      queuedTransactionsCount: pendingNonce - latestNonce - 1,
      pendingTransactionDetails: await getPendingTransactionsForWallet2(
        wallet.address,
        chain,
      ),
    };
  } catch (error) {
    console.log('error', error);
  }
};

const getAllPendingTransactions = async () => {
  let transactions: EvmPendingTransaction[] =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_PENDING_TRANSACTIONS,
    );
  return transactions ?? [];
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

const getPendingTransactionsForWallet2 = async (
  walletAddress: string,
  chain: EvmChain,
): Promise<EvmPendingTransactionDetails> => {
  console.log('checking pending transactions for wallet', walletAddress, chain);
  const provider = await EthersUtils.getProvider(chain);
  switch (chain.blockExplorer?.type) {
    case BlockExplorerType.BLOCKSCOUT: {
      const result = await BlockscoutApi.getPendingTransactions(
        chain,
        walletAddress,
      );
      const pendingTx = new TransactionResponse(result[0], provider);

      const tokensMetadata = await EvmTokensUtils.getMetadataFromStorage(chain);
      const item = await EvmTokensHistoryParserUtils.parseEvent(
        result[0],
        chain,
        walletAddress.toLowerCase(),
        tokensMetadata,
      );

      return {
        label:
          item?.label ??
          chrome.i18n.getMessage('evm_unknown_pending_transaction'),
        title: 'evm_pending_transactions',
        transactionResponse: pendingTx,
      };
    }
    default: {
      return {
        label: chrome.i18n.getMessage('evm_unknown_pending_transaction'),
        title: 'evm_pending_queued_transactions',
      };
    }
  }
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
    ? Math.max(
        ...transactions.map((pendingTx) => pendingTx.txResponseParams.nonce),
      )
    : 0;
};

const getCanceledTransactions = async (
  chain: EvmChain,
  address: string,
  tokenInfo: EvmSmartContractInfo,
): Promise<CanceledTransactionData[]> => {
  const data = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_PENDING_TRANSACTIONS,
  );

  if (!data) return [];
  if (!data[chain.chainId]) return [];
  if (!data[chain.chainId][address]) return [];
  return data[address].filter(
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
  getPendingTransactionsForWallet2,
};
