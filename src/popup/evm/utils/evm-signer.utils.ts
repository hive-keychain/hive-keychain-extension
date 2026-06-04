import {
  personalSign,
  signTypedData,
  SignTypedDataVersion,
  TypedDataUtils,
} from '@metamask/eth-sig-util';
import {
  EvmAccountSource,
  EvmLedgerWallet,
  EvmWallet,
} from '@popup/evm/interfaces/wallet.interface';
import { EvmLedgerUtils } from '@popup/evm/utils/evm-ledger.utils';
import {
  ethers,
  HDNodeWallet,
  Provider,
  TransactionRequest,
  TransactionResponse,
  Wallet,
} from 'ethers';

const addHexPrefix = (value: string) =>
  value.startsWith('0x') ? value : `0x${value}`;

const getSignatureV = (v: number) => {
  return v < 27 ? v + 27 : v;
};

const formatLedgerSignature = (signature: {
  r: string;
  s: string;
  v: string | number;
}) => {
  const v =
    typeof signature.v === 'number'
      ? signature.v
      : parseInt(signature.v.replace(/^0x/, ''), 16);
  const normalizedV = getSignatureV(v);
  return ethers.Signature.from({
    r: addHexPrefix(signature.r),
    s: addHexPrefix(signature.s),
    v: normalizedV,
  });
};

const isLedgerWallet = (wallet: EvmWallet): wallet is EvmLedgerWallet => {
  return 'source' in wallet && wallet.source === EvmAccountSource.LEDGER;
};

const getWalletAddress = (wallet: EvmWallet) => wallet.address;

const getMessageHex = (message: string) => {
  if (ethers.isHexString(message)) {
    return message.replace(/^0x/, '');
  }

  return ethers.hexlify(ethers.toUtf8Bytes(message)).replace(/^0x/, '');
};

const getPrivateKey = (wallet: EvmWallet) => {
  if (isLedgerWallet(wallet)) {
    throw new Error('Ledger wallet does not expose a private key');
  }

  return (wallet as HDNodeWallet).privateKey;
};

const signMessage = async (wallet: EvmWallet, message: string) => {
  if (isLedgerWallet(wallet)) {
    const signature = await EvmLedgerUtils.signPersonalMessage(
      wallet.path,
      getMessageHex(message),
    );
    return formatLedgerSignature(signature).serialized;
  }

  return personalSign({
    privateKey: Buffer.from(getPrivateKey(wallet).substring(2), 'hex'),
    data: message,
  });
};

const getTypedDataMessage = (message: string | object) => {
  return typeof message === 'string' ? JSON.parse(message) : message;
};

const getLedgerTransactionData = (data: TransactionRequest['data']) => {
  if (data == null || data === '') {
    return '0x';
  }

  return ethers.hexlify(data);
};

const getLedgerSerializableTransaction = (
  transactionRequest: TransactionRequest,
) => {
  const serializableTransaction = { ...transactionRequest };
  const data = serializableTransaction.data;
  delete serializableTransaction.from;

  return {
    ...serializableTransaction,
    data: getLedgerTransactionData(data),
  } as ethers.TransactionLike<string>;
};

const signTypedMessage = async (
  wallet: EvmWallet,
  message: string | object,
  version: SignTypedDataVersion,
) => {
  if (isLedgerWallet(wallet)) {
    if (
      version !== SignTypedDataVersion.V3 &&
      version !== SignTypedDataVersion.V4
    ) {
      const error = new Error('Ledger does not support this typed data version');
      (error as any).code = 'UNSUPPORTED_OPERATION';
      throw error;
    }

    const typedMessage = getTypedDataMessage(message) as any;
    const domainSeparatorHex = TypedDataUtils.eip712DomainHash(
      typedMessage,
      version,
    ).toString('hex');
    const hashStructMessageHex = TypedDataUtils.hashStruct(
      typedMessage.primaryType,
      typedMessage.message,
      typedMessage.types,
      version,
    ).toString('hex');
    const signature = await EvmLedgerUtils.signEIP712HashedMessage(
      wallet.path,
      domainSeparatorHex,
      hashStructMessageHex,
    );
    return formatLedgerSignature(signature).serialized;
  }

  return signTypedData({
    privateKey: Buffer.from(getPrivateKey(wallet).substring(2), 'hex'),
    data: getTypedDataMessage(message) as any,
    version,
  });
};

const sendTransaction = async (
  wallet: EvmWallet,
  transactionRequest: TransactionRequest,
  provider: Provider,
): Promise<TransactionResponse> => {
  if (!isLedgerWallet(wallet)) {
    const connectedWallet = new Wallet(
      (wallet as HDNodeWallet).signingKey,
      provider,
    );
    return connectedWallet.sendTransaction(transactionRequest);
  }

  const unsignedTransaction = ethers.Transaction.from(
    getLedgerSerializableTransaction(transactionRequest),
  );
  const signature = await EvmLedgerUtils.signTransaction(
    wallet.path,
    unsignedTransaction.unsignedSerialized,
  );
  const signedTransaction = ethers.Transaction.from(
    unsignedTransaction.unsignedSerialized,
  );
  signedTransaction.signature = formatLedgerSignature(signature);
  return provider.broadcastTransaction(signedTransaction.serialized);
};

export const EvmSignerUtils = {
  isLedgerWallet,
  getWalletAddress,
  signMessage,
  signTypedMessage,
  sendTransaction,
};
