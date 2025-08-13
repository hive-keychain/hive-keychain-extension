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
import { EvmTransactionsUtils } from '@popup/evm/utils/evm-transactions.utils';
import { Chain, EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { defaultChainList } from '@popup/multichain/reference-data/chains.list';
import { BlockTag, ethers } from 'ethers';
import Logger from 'src/utils/logger.utils';

const instanciateProvider = async (chain?: EvmChain) => {
  if (!chain) chain = (await EvmChainUtils.getLastEvmChain()) as EvmChain;
  const provider = await EthersUtils.getProvider(chain);
  return provider;
};

const getEthProvider = () => {
  const ethChain = defaultChainList.find(
    (chain: Chain) => chain.chainId === '0x1',
  );

  const provider = new ethers.JsonRpcProvider(ethChain!.rpc[0].url, undefined, {
    staticNetwork: ethers.Network.from(Number(ethChain!.chainId)),
  });
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

const getMaxPriorityFeePerGas = async () => {
  return call('eth_maxPriorityFeePerGas', []);
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
  const provider = await instanciateProvider();

  const response = await provider.send(method, params);
  return response;
};

const signMessage = async (privateKey: string, message: string) => {
  return personalSign({
    privateKey: Buffer.from(privateKey.substring(2), 'hex'),
    data: message,
  });
};

const signData = async (
  privateKey: string,
  message: any,
  version: SignTypedDataVersion,
) => {
  console.log({ privateKey, message, version });
  try {
    return signTypedData({
      privateKey: Buffer.from(privateKey.substring(2), 'hex'),
      data: JSON.parse(message),
      version,
    });
  } catch (err) {
    console.log(err);
    return null;
  }
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

const getNonce = async (account: EvmAccount, chain: EvmChain) => {
  const provider = await instanciateProvider(chain);
  const nonce = await provider.getTransactionCount(account.wallet.address);

  const highestPendingNonce =
    await EvmTransactionsUtils.getHighestNonceInPendingTransaction(
      chain.chainId,
      account.wallet.address,
    );
  return Math.max(nonce, highestPendingNonce + 1);
};

const getEnsResolver = async (ensAddress: string) => {
  return getEthProvider().getResolver(ensAddress);
};

const resolveEns = async (ensAddress: string) => {
  const ensResolver = await getEnsResolver(ensAddress);
  return ensResolver ? ensResolver.getAddress() : '';
};

const lookupEns = async (address: string) => {
  try {
    const provider = getEthProvider();
    return await provider.lookupAddress(address);
  } catch (err) {
    return null;
  }
};

const getResolveData = async (ensAddress: string) => {
  try {
    const ensResolver = await getEnsResolver(ensAddress);
    if (ensResolver) {
      const [address, avatar] = await Promise.all([
        ensResolver.getAddress(),
        ensResolver.getAvatar(),
      ]);

      return {
        address,
        avatar,
      };
    }
  } catch (err) {
    Logger.warn(`Cannot resolve address ${ensAddress}`);
  }
  return null;
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
  signData,
  personalRecover,
  getEncryptionKey,
  decryptMessage,
  getGasPrice,
  getNonce,
  resolveEns,
  lookupEns,
  getEnsResolver,
  getResolveData,
  getMaxPriorityFeePerGas,
};
