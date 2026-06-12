import { PendingHiveAccountCreationRequest } from '@interfaces/hive-account-creation.interface';
import {
  EvmSmartContractInfoErc20,
  EvmSmartContractInfoNative,
  EVMSmartContractType,
} from '@popup/evm/interfaces/evm-tokens.interface';
import {
  EvmTransactionType,
  ProviderTransactionData,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { Erc20Abi } from '@popup/evm/reference-data/abi.data';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ethers, parseUnits } from 'ethers';

type PaymentTokenInfo =
  | EvmSmartContractInfoNative
  | EvmSmartContractInfoErc20;

const isEvmPaymentRequest = (
  request: PendingHiveAccountCreationRequest,
): boolean =>
  request.paymentCurrency.startsWith('EVM:') &&
  !!request.paymentChainId &&
  !!request.payerEvmAddress;

const getPaymentTokenPriceUsd = (
  request: PendingHiveAccountCreationRequest,
) => {
  const priceUsd = Number(request.paymentPriceUsd);
  return Number.isFinite(priceUsd) ? priceUsd : null;
};

const buildNativePaymentTokenInfo = (
  request: PendingHiveAccountCreationRequest,
  chain: EvmChain,
): EvmSmartContractInfoNative => ({
  type: EVMSmartContractType.NATIVE,
  name: request.paymentTokenName || chain.mainToken,
  symbol: request.paymentTokenSymbol || chain.mainToken,
  logo: request.paymentTokenLogo || chain.logo,
  chainId: chain.chainId,
  backgroundColor: '',
  coingeckoId: chain.nativeCoinId || '',
  priceUsd: getPaymentTokenPriceUsd(request),
  createdAt: new Date(0).toISOString(),
  categories: [],
});

const buildErc20PaymentTokenInfo = (
  request: PendingHiveAccountCreationRequest,
  chain: EvmChain,
): EvmSmartContractInfoErc20 | undefined => {
  if (
    !request.paymentTokenAddress ||
    typeof request.paymentTokenDecimals !== 'number'
  ) {
    return undefined;
  }

  return {
    type: EVMSmartContractType.ERC20,
    name:
      request.paymentTokenName ||
      request.paymentTokenSymbol ||
      request.paymentTokenAddress,
    symbol: request.paymentTokenSymbol || 'Token',
    decimals: request.paymentTokenDecimals,
    logo: request.paymentTokenLogo || '',
    chainId: chain.chainId,
    contractAddress: request.paymentTokenAddress,
    backgroundColor: '',
    coingeckoId: undefined,
    priceUsd: getPaymentTokenPriceUsd(request),
    possibleSpam: false,
    verifiedContract: true,
    isProxy: false,
    proxyTarget: null,
    validated: 0,
  };
};

const buildPaymentTokenInfo = (
  request: PendingHiveAccountCreationRequest,
  chain: EvmChain,
): PaymentTokenInfo | undefined => {
  return request.paymentTokenAddress
    ? buildErc20PaymentTokenInfo(request, chain)
    : buildNativePaymentTokenInfo(request, chain);
};

const getPaymentTokenDecimals = (tokenInfo: PaymentTokenInfo) =>
  tokenInfo.type === EVMSmartContractType.ERC20 ? tokenInfo.decimals : 18;

const buildErc20TransferData = (
  request: PendingHiveAccountCreationRequest,
  tokenInfo: EvmSmartContractInfoErc20,
) => {
  const contractInterface = new ethers.Interface(Erc20Abi);
  return contractInterface.encodeFunctionData('transfer', [
    request.paymentAddress,
    parseUnits(request.amount, tokenInfo.decimals),
  ]);
};

const buildPaymentTransactionData = (
  request: PendingHiveAccountCreationRequest,
  payerAddress: string,
  tokenInfo: PaymentTokenInfo,
  transactionType: EvmTransactionType,
): ProviderTransactionData => {
  if (!request.paymentAddress) {
    throw new Error('Payment address is missing.');
  }

  const decimals = getPaymentTokenDecimals(tokenInfo);
  const isNativePayment = tokenInfo.type === EVMSmartContractType.NATIVE;

  return {
    from: payerAddress,
    type: transactionType,
    to: isNativePayment ? request.paymentAddress : tokenInfo.contractAddress,
    data: isNativePayment
      ? ''
      : buildErc20TransferData(request, tokenInfo as EvmSmartContractInfoErc20),
    value: isNativePayment
      ? ethers.toQuantity(parseUnits(request.amount, decimals))
      : '0x0',
  };
};

const EVM_PAYMENT_TX_HASH_PATTERN = /^0x[a-fA-F0-9]{64}$/;
const HIVE_PAYMENT_TX_HASH_PATTERN = /^[a-fA-F0-9]{40}$/;

const normalizePaymentTxHash = (txHash: string) => txHash.trim();

const isValidPaymentTxHash = (
  request: PendingHiveAccountCreationRequest,
  txHash: string,
): boolean => {
  const normalizedTxHash = normalizePaymentTxHash(txHash);
  if (!normalizedTxHash) {
    return false;
  }

  return isEvmPaymentRequest(request)
    ? EVM_PAYMENT_TX_HASH_PATTERN.test(normalizedTxHash)
    : HIVE_PAYMENT_TX_HASH_PATTERN.test(normalizedTxHash);
};

const HIVE_PAYMENT_CHAIN_LABEL = 'Hive';

const getPaymentChainLabel = (
  request: PendingHiveAccountCreationRequest,
  chain?: EvmChain,
): string => {
  if (isEvmPaymentRequest(request)) {
    return chain?.name || request.paymentChainId || 'EVM';
  }

  return HIVE_PAYMENT_CHAIN_LABEL;
};

const getPaymentTokenLabel = (
  request: PendingHiveAccountCreationRequest,
  chain?: EvmChain,
): string => {
  if (isEvmPaymentRequest(request)) {
    return (
      request.paymentTokenName ||
      request.paymentTokenSymbol ||
      chain?.mainToken ||
      'Token'
    );
  }

  return request.paymentCurrency;
};

export const PaidAccountCreationPaymentUtils = {
  isEvmPaymentRequest,
  getPaymentChainLabel,
  getPaymentTokenLabel,
  buildPaymentTokenInfo,
  buildPaymentTransactionData,
  normalizePaymentTxHash,
  isValidPaymentTxHash,
};
