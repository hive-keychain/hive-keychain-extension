import {
  EvmSmartContractInfo,
  EVMSmartContractType,
  PendingTransactionData,
  UserPendingTransactions,
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
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { EvmRequestsUtils } from '@popup/evm/utils/evm-requests.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
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
      nonce: nonce ?? (await connectedWallet.getNonce()),
      gasLimit: BigInt(gasFee.gasLimit.toFixed(0)),
      chainId: chain.chainId,
      ...feeData,
    };
  } else {
    transactionRequest = {
      to: receiverAddress,
      value: ethers.parseEther(amount.toString()),
      from: connectedWallet.address,
      nonce: nonce ?? (await connectedWallet.getNonce()),
      gasLimit: BigInt(gasFee.gasLimit.toFixed(0)),
      chainId: chain.chainId,
      ...feeData,
    };
  }

  const transactionResponse = await connectedWallet.sendTransaction(
    transactionRequest,
  );

  await addPendingTransaction(
    transactionResponse,
    connectedWallet.address,
    tokenInfo,
    amount,
    gasFee,
    receiverAddress,
  );

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

const addPendingTransaction = async (
  transactionResponse: TransactionResponse,
  address: string,
  tokenInfo: EvmSmartContractInfo,
  amount: number,
  gasFee: GasFeeEstimationBase,
  receiverAddress: string,
) => {
  let transactions: UserPendingTransactions =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_USER_PENDING_TRANSACTIONS,
    );
  if (!transactions) {
    transactions = {};
  }
  if (!transactions[address]) {
    transactions[address] = [];
  }
  transactions[address].push({
    transaction: transactionResponse,
    amount,
    tokenInfo,
    gasFee,
    receiverAddress,
  });

  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_USER_PENDING_TRANSACTIONS,
    transactions,
  );
};

const deleteFromPendingTransactions = async (
  address: string,
  nonce: number,
) => {
  const data = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_USER_PENDING_TRANSACTIONS,
  );

  data[address] = data[address].filter(
    (pendingTransaction: PendingTransactionData) =>
      pendingTransaction.transaction.nonce !== nonce,
  );

  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_USER_PENDING_TRANSACTIONS,
    data,
  );
};

const getPendingTransactions = async (
  address: string,
  tokenInfo: EvmSmartContractInfo,
) => {
  const data = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_USER_PENDING_TRANSACTIONS,
  );

  if (!data) return [];
  if (!data[address]) return [];
  return data[address].filter(
    (pendingTransaction: PendingTransactionData) =>
      pendingTransaction.tokenInfo.symbol === tokenInfo.symbol &&
      pendingTransaction.tokenInfo.coingeckoId === tokenInfo.coingeckoId,
  );
};
const getCanceledTransactions = async (
  chain: EvmChain,
  address: string,
  tokenInfo: EvmSmartContractInfo,
): Promise<CanceledTransactionData[]> => {
  const data = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_USER_PENDING_TRANSACTIONS,
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
    LocalStorageKeyEnum.EVM_USER_CANCELED_TRANSACTIONS,
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
      LocalStorageKeyEnum.EVM_USER_CANCELED_TRANSACTIONS,
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
    LocalStorageKeyEnum.EVM_USER_CANCELED_TRANSACTIONS,
    transactions,
  );
};

const send = async (account: EvmAccount, request: any, gasFee: any) => {
  const lastChain = await EvmChainUtils.getLastEvmChain();

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
    value: 0,
    data: request.params[0].data,
    to: request.params[0].to,
    from: account.wallet.address,
    nonce: await EvmRequestsUtils.getNonce(account),
    gasLimit: gasFee ? BigInt(gasFee.gasLimit.toFixed(0)) : null,
    chainId: lastChain.chainId,
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

  const provider = EthersUtils.getProvider(lastChain as EvmChain);
  const connectedWallet = new Wallet(account.wallet.signingKey, provider);

  const transactionResponse = await connectedWallet.sendTransaction(
    transactionRequest,
  );
  return transactionResponse.hash;
};

export const EvmTransactionsUtils = {
  transfer,
  cancel,
  getPendingTransactions,
  addPendingTransaction,
  deleteFromPendingTransactions,
  getCanceledTransactions,
  addCanceledTransaction,
  getAllCanceledTransactions,
  send,
};
