import {
  EvmPendingTransaction,
  EvmSmartContractInfo,
  EVMSmartContractType,
} from '@popup/evm/interfaces/evm-tokens.interface';
import {
  CanceledTransactionData,
  EvmTransactionType,
  UserCanceledTransactions,
} from '@popup/evm/interfaces/evm-transactions.interface';
import {
  GasFeeData,
  GasFeeEstimationBase,
} from '@popup/evm/interfaces/gas-fee.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { Erc20Abi } from '@popup/evm/reference-data/abi.data';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmPendingTransactionsNotifications } from '@popup/evm/utils/evm-pending-transactions-notifications.utils';
import { EvmRequestsUtils } from '@popup/evm/utils/evm-requests.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import {
  ethers,
  HDNodeWallet,
  TransactionRequest,
  TransactionResponse,
  Wallet,
} from 'ethers';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const transfer = async (
  chain: EvmChain,
  tokenInfo: EvmSmartContractInfo,
  receiverAddress: string,
  amount: number,
  wallet: HDNodeWallet,
  gasFee: GasFeeEstimationBase,
  nonce?: number,
  transactionType?: EvmTransactionType,
) => {
  const provider = EthersUtils.getProvider(chain);
  const connectedWallet = new Wallet(wallet.signingKey, provider);
  let transactionRequest: TransactionRequest;

  let feeData;
  switch (transactionType) {
    case EvmTransactionType.EIP_1559: {
      feeData = {
        maxPriorityFeePerGas: ethers.parseUnits(
          gasFee.priorityFee!.toString(),
          'gwei',
        ),
        maxFeePerGas: ethers.parseUnits(
          gasFee.maxFeePerGas!.toString(),
          'gwei',
        ),
      };
      break;
    }
    case EvmTransactionType.LEGACY: {
      feeData = {
        gasPrice: ethers.parseUnits(gasFee.gasPrice!.toString(), 'gwei'),
      };
      break;
    }
  }

  if (tokenInfo.type === EVMSmartContractType.ERC20) {
    const contract = new ethers.Contract(
      tokenInfo.address!,
      Erc20Abi,
      connectedWallet,
    );

    const data = contract.interface.encodeFunctionData('transfer', [
      receiverAddress,
      amount * 1000000,
    ]);

    transactionRequest = {
      to: tokenInfo.address!,
      value: 0,
      data: data,
      from: connectedWallet.address,
      nonce: nonce ?? (await connectedWallet.getNonce(chain.chainId)),
      gasLimit: BigInt(gasFee.gasLimit.toFixed(0)),
      chainId: chain.chainId,
      ...feeData,
    };
  } else {
    transactionRequest = {
      to: receiverAddress,
      value: ethers.parseEther(amount.toString()),
      from: connectedWallet.address,
      nonce: nonce ?? (await connectedWallet.getNonce(chain.chainId)),
      gasLimit: BigInt(gasFee.gasLimit.toFixed(0)),
      chainId: chain.chainId,
      ...feeData,
    };
  }

  const transactionResponse = await connectedWallet.sendTransaction(
    transactionRequest,
  );

  // TODO here add pending transaction
  // await addPendingTransaction(
  //   transactionResponse,
  //   connectedWallet.address,
  //   tokenInfo,
  //   amount,
  //   gasFee,
  //   receiverAddress,
  // );

  return transactionResponse;
};

const cancel = async (
  transactionResponse: TransactionResponse,
  chain: EvmChain,
  gasFee: GasFeeEstimationBase,
  wallet: HDNodeWallet,
  amount: number,
  tokenInfo: EvmSmartContractInfo,
  receiverAddress: string,
  transactionType: EvmTransactionType,
) => {
  let feeData: GasFeeData;
  switch (transactionType) {
    case EvmTransactionType.EIP_1559: {
      feeData = {
        priorityFee: ethers.parseUnits(gasFee.priorityFee!.toString(), 'gwei'),
        maxFeePerGas: ethers.parseUnits(
          gasFee.maxFeePerGas!.toString(),
          'gwei',
        ),
      };
      break;
    }
    case EvmTransactionType.LEGACY: {
      feeData = {
        gasPrice: ethers.parseUnits(gasFee.gasPrice!.toString(), 'gwei'),
      };
      break;
    }
    case EvmTransactionType.EIP_155: {
      feeData = {}; // TODO check
      break;
    }
    case EvmTransactionType.EIP_4844: {
      feeData = {}; // TODO Check
      break;
    }
  }

  const newGasFee = {
    ...gasFee,
    ...feeData,
  } as GasFeeEstimationBase;

  addCanceledTransaction(
    transactionResponse,
    wallet.address,
    tokenInfo,
    amount,
    receiverAddress,
    chain,
  );

  return transfer(
    chain,
    { type: EVMSmartContractType.NATIVE } as EvmSmartContractInfo,
    ethers.ZeroAddress,
    0,
    wallet,
    newGasFee,
    transactionResponse.nonce,
  );
};

// New functions
// TODO delete useless functions after finish refactoring

const addPendingTransaction2 = async (
  walletAddress: string,
  transactionResponse: TransactionResponse,
) => {
  let transactions = await getAllPendingTransactions();

  transactions.push({
    txResponseParams: transactionResponse.toJSON(),
    walletAddress: walletAddress,
  });

  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_PENDING_TRANSACTIONS,
    transactions,
  );

  EvmPendingTransactionsNotifications.waitForTransaction(transactionResponse);
};

const deleteFromPendingTransactions2 = async (txHash: string) => {
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

const getAllPendingTransactions = async () => {
  let transactions: EvmPendingTransaction[] =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_PENDING_TRANSACTIONS,
    );
  return transactions ?? [];
};

const getPendingTransactionsForWallet = async (walletAddress: string) => {
  let transactions = await getAllPendingTransactions();
  return transactions.filter(
    (transaction) =>
      transaction.walletAddress.toLowerCase() === walletAddress.toLowerCase(),
  );
};

const getPendingTransaction = async (txHash: string) => {
  let transactions = await getAllPendingTransactions();
  return transactions.find(
    (transaction: EvmPendingTransaction) =>
      transaction.txResponseParams.hash === txHash,
  );
};

const getHighestNonceInPendingTransaction = async (
  chainId: string,
  walletAddress: string,
) => {
  const transactions = await getPendingTransactionsForWallet(walletAddress);
  const walletTransactions = transactions.filter((pendingTx) => {
    return (
      `0x${Number(pendingTx.txResponseParams.chainId).toString(16)}` === chainId
    );
  });

  return walletTransactions.length > 0
    ? Math.max(
        ...walletTransactions.map(
          (pendingTx) => pendingTx.txResponseParams.nonce,
        ),
      )
    : 0;
};

// Old functions to replace
// const addPendingTransaction = async (
//   transactionResponse: TransactionResponse,
//   address: string,
//   tokenInfo: EvmSmartContractInfo,
//   amount: number,
//   gasFee: GasFeeEstimationBase,
//   receiverAddress: string,
// ) => {
//   let transactions: UserPendingTransactions =
//     await LocalStorageUtils.getValueFromLocalStorage(
//       LocalStorageKeyEnum.EVM_PENDING_TRANSACTIONS,
//     );
//   if (!transactions) {
//     transactions = {};
//   }
//   if (!transactions[address]) {
//     transactions[address] = [];
//   }
//   transactions[address].push({
//     transaction: transactionResponse,
//     amount,
//     tokenInfo,
//     gasFee,
//     receiverAddress,
//   });

//   await LocalStorageUtils.saveValueInLocalStorage(
//     LocalStorageKeyEnum.EVM_PENDING_TRANSACTIONS,
//     transactions,
//   );
// };

// const deleteFromPendingTransactions = async (
//   address: string,
//   nonce: number,
// ) => {
//   const data = await LocalStorageUtils.getValueFromLocalStorage(
//     LocalStorageKeyEnum.EVM_PENDING_TRANSACTIONS,
//   );

//   data[address] = data[address].filter(
//     (pendingTransaction: PendingTransactionData) =>
//       pendingTransaction.transaction.nonce !== nonce,
//   );

//   await LocalStorageUtils.saveValueInLocalStorage(
//     LocalStorageKeyEnum.EVM_PENDING_TRANSACTIONS,
//     data,
//   );
// };

// const getPendingTransactions = async (
//   address: string,
//   tokenInfo: EvmSmartContractInfo,
// ) => {
//   const data = await LocalStorageUtils.getValueFromLocalStorage(
//     LocalStorageKeyEnum.EVM_PENDING_TRANSACTIONS,
//   );

//   if (!data) return [];
//   if (!data[address]) return [];
//   return data[address].filter(
//     (pendingTransaction: PendingTransactionData) =>
//       pendingTransaction.tokenInfo.symbol === tokenInfo.symbol &&
//       pendingTransaction.tokenInfo.coingeckoId === tokenInfo.coingeckoId,
//   );
// };

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

const send = async (account: EvmAccount, request: any, gasFee: any) => {
  const chain = await ChainUtils.getChain<EvmChain>(request.chainId);

  let feeData = {};
  if (gasFee)
    switch (gasFee.type) {
      case EvmTransactionType.EIP_1559: {
        feeData = {
          maxPriorityFeePerGas: ethers.parseUnits(
            gasFee.priorityFee!.toString(),
            'gwei',
          ),
          maxFeePerGas: ethers.parseUnits(
            gasFee.maxFeePerGas!.toString(),
            'gwei',
          ),
        };
        break;
      }
      case EvmTransactionType.EIP_155:
      case EvmTransactionType.LEGACY: {
        feeData = {
          gasPrice: ethers.parseUnits(gasFee.gasPrice!.toString(), 'gwei'),
        };
        break;
      }
    }

  let transactionRequest: TransactionRequest;
  transactionRequest = {
    value: request.params[0].value,
    data: request.params[0].data,
    to: request.params[0].to,
    from: account.wallet.address,
    nonce: await EvmRequestsUtils.getNonce(account, chain),
    gasLimit: gasFee ? BigInt(gasFee.gasLimit.toFixed(0)) : null,
    chainId: chain.chainId,
    type: request.params[0].type,
    ...feeData,
  };

  if (
    request.params[0].type &&
    request.params[0].type === EvmTransactionType.EIP_155
  ) {
    if (request.params[0].accessList) {
      transactionRequest.accessList = request.params[0].accessList;
    }
  }

  console.log({ transactionRequest });

  const provider = EthersUtils.getProvider(chain as EvmChain);
  const connectedWallet = new Wallet(account.wallet.signingKey, provider);

  const transactionResponse: TransactionResponse =
    await connectedWallet.sendTransaction(transactionRequest);

  addPendingTransaction2(connectedWallet.address, transactionResponse);

  return transactionResponse.hash;
};

export const EvmTransactionsUtils = {
  transfer,
  cancel,
  // getPendingTransactions,
  // addPendingTransaction,
  // deleteFromPendingTransactions,
  getHighestNonceInPendingTransaction,
  getPendingTransaction,
  getAllPendingTransactions,
  getPendingTransactionsForWallet,
  addPendingTransaction2,
  deleteFromPendingTransactions2,
  //
  getCanceledTransactions,
  addCanceledTransaction,
  getAllCanceledTransactions,
  send,
};
