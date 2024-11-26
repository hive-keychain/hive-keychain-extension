import {
  decrypt,
  EthEncryptedData,
  getEncryptionPublicKey,
  personalSign,
  recoverPersonalSignature,
  signTypedData,
  SignTypedDataVersion,
} from '@metamask/eth-sig-util';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { BlockTag } from 'ethers';

const instanciateProvider = async (rpcUrl?: string) => {
  const activeChain = await EvmChainUtils.getLastEvmChain();
  const provider = await EthersUtils.getProvider(activeChain as EvmChain);
  return provider;
};

const getBlock = async (blockTag: BlockTag, hydrated: boolean) => {
  const provider = await instanciateProvider();
  return provider.getBlock(blockTag, hydrated);
};

const getBlockNumber = async () => {
  const provider = await instanciateProvider();
  return provider.getBlockNumber();
};

const estimateGasFee = async () => {
  const activeChain = await EvmChainUtils.getLastEvmChain();
  return '222';
  //   return await GasFeeUtils.estimate(activeChain);
};

const getGasPrice = async () => {
  return call('eth_gasPrice', []);
};

const getBalance = async (walletAddress: string, blockTag: BlockTag) => {
  const provider = await instanciateProvider();
  const balance = await provider.getBalance(walletAddress, blockTag);
  return `0x${Number(balance).toString(16)}`;
};

const getTransactionByBlockAndIndex = async (
  blockTag: BlockTag,
  index: number,
) => {
  const block = await getBlock(blockTag, true);
  const transaction = await block?.getTransaction(Number(index));
  return transaction;
};
const getTransactionCountByBlock = async (
  blockTag: BlockTag,
  hydrated: boolean,
) => {
  const block = await getBlock(blockTag, hydrated);
  return `0x${Number(block?.transactions.length).toString(16)}`;
};

const getCode = async (address: string, blockTag: BlockTag) => {
  const provider = await instanciateProvider();
  return provider.getCode(address);
  // return provider.getCode(address, blockTag);
};

const getTransactionByHash = async (transactionHash: string) => {
  const provider = await instanciateProvider();
  return provider.getTransactionResult(transactionHash);
};

const getTransactionCountForAddress = async (
  walletAddress: string,
  blockTag?: BlockTag,
) => {
  const provider = await instanciateProvider();
  const count = await provider.getTransactionCount(walletAddress, blockTag);

  return Number(count).toString(16);
};

const getTransactionReceipt = async (transactionHash: string) => {
  const provider = await instanciateProvider();
  return provider.getTransactionReceipt(transactionHash);
};

const call = async (method: string, params: any[]) => {
  console.log({ method, params }, 'call');

  const provider = await instanciateProvider();
  return provider.send(method, params);

  // return EvmRpcUtils.call(method, params, activeChain.rpc[1].url);
};

const signMessage = async (privateKey: string, message: string) => {
  return personalSign({
    privateKey: Buffer.from(privateKey.substring(2), 'hex'),
    data: message,
  });
};

const signV4 = async (privateKey: string, message: any) => {
  return signTypedData({
    privateKey: Buffer.from(privateKey.substring(2), 'hex'),
    data: JSON.parse(message),
    version: SignTypedDataVersion.V4,
  });
};

const personalRecover = async (digest: string, signature: string) => {
  return recoverPersonalSignature({
    data: digest,
    signature: signature,
  });
};

const getEncryptionKey = async (account: EvmAccount) => {
  return getEncryptionPublicKey(account.wallet.privateKey.substring(2)!);
};

const decryptMessage = (account: EvmAccount, message: string) => {
  const stripped = message.substring(2);
  const buff = Buffer.from(stripped, 'hex');
  const encryptedData: EthEncryptedData = JSON.parse(buff.toString('utf8'));
  return decrypt({
    encryptedData: encryptedData,
    privateKey: account.wallet.signingKey.privateKey.substring(2),
  });
};

const getNonce = async (account: EvmAccount) => {
  const provider = await instanciateProvider();
  return await provider.getTransactionCount(account.wallet.address);
};

export const EvmRequestsUtils = {
  getBalance,
  getBlockNumber,
  getBlock,
  estimateGasFee,
  getTransactionByBlockAndIndex,
  getTransactionCountByBlock,
  getCode,
  getTransactionByHash,
  getTransactionCountForAddress,
  getTransactionReceipt,
  call,
  signMessage,
  signV4,
  personalRecover,
  getEncryptionKey,
  decryptMessage,
  getGasPrice,
  getNonce,
};
