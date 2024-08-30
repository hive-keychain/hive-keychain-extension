import {
  EvmTokenInfoShort,
  EVMTokenType,
  PendingTransactionData,
  UserPendingTransactions,
} from '@popup/evm/interfaces/evm-tokens.interface';
import {
  CanceledTransactionData,
  UserCanceledTransactions,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { GasFeeEstimation } from '@popup/evm/interfaces/gas-fee.interface';
import { Erc20Abi } from '@popup/evm/reference-data/abi.data';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
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

const transfer = async (
  chain: EvmChain,
  tokenInfo: EvmTokenInfoShort,
  receiverAddress: string,
  amount: number,
  wallet: HDNodeWallet,
  gasFee: GasFeeEstimation,
  nonce?: number,
) => {
  const provider = EthersUtils.getProvider(chain);
  const connectedWallet = new Wallet(wallet.signingKey, provider);
  let transactionRequest: TransactionRequest;
  if (tokenInfo.type === EVMTokenType.ERC20) {
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
      maxPriorityFeePerGas: ethers.parseUnits(
        gasFee.priorityFee.toString(),
        'gwei',
      ),
      maxFeePerGas: ethers.parseUnits(gasFee.maxFeePerGas.toString(), 'gwei'),
      gasLimit: BigInt(gasFee.gasLimit.toFixed(0)),
      chainId: chain.chainId,
    };
  } else {
    transactionRequest = {
      to: receiverAddress,
      value: amount * 1000000000000000000,
      from: connectedWallet.address,
      nonce: nonce ?? (await connectedWallet.getNonce()),
      maxPriorityFeePerGas: ethers.parseUnits(
        gasFee.priorityFee.toString(),
        'gwei',
      ),
      maxFeePerGas: ethers.parseUnits(gasFee.maxFeePerGas.toString(), 'gwei'),
      gasLimit: BigInt(gasFee.gasLimit.toFixed(0)),
      chainId: chain.chainId,
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
  gasFee: GasFeeEstimation,
  wallet: HDNodeWallet,
  amount: number,
  tokenInfo: EvmTokenInfoShort,
  receiverAddress: string,
) => {
  const newGasFee: GasFeeEstimation = {
    ...gasFee,
    maxFeePerGas: new Decimal(gasFee.maxFeePerGas).mul(1.5).toNumber(),
    priorityFee: new Decimal(gasFee.priorityFee).mul(1.5).toNumber(),
  };

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
    { type: EVMTokenType.NATIVE } as EvmTokenInfoShort,
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
  tokenInfo: EvmTokenInfoShort,
  amount: number,
  gasFee: GasFeeEstimation,
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

  LocalStorageUtils.saveValueInLocalStorage(
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
  tokenInfo: EvmTokenInfoShort,
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
  tokenInfo: EvmTokenInfoShort,
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
  tokenInfo: EvmTokenInfoShort,
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

export const EvmTransactionsUtils = {
  transfer,
  cancel,
  getPendingTransactions,
  addPendingTransaction,
  deleteFromPendingTransactions,
  getCanceledTransactions,
  addCanceledTransaction,
  getAllCanceledTransactions,
};