import type { BalanceInfo } from '@dialog/components/balance-change-card/balance-change-card.interface';
import {
  EvmSmartContractInfoErc20,
  EvmSmartContractInfoNative,
  EVMSmartContractType,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { GasFeeEstimationBase } from '@popup/evm/interfaces/gas-fee.interface';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { GasFeeUtils } from '@popup/evm/utils/gas-fee.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { PortfolioCanonicalAsset } from 'src/portfolio/portfolio-api.interface';
import Decimal from 'decimal.js';
import { ethers } from 'ethers';

const NATIVE_TOKEN_PLACEHOLDER_ADDRESS =
  '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

const isNativeSwapTokenAddress = (address: string): boolean => {
  const normalized = address.trim().toLowerCase();
  return (
    normalized === ethers.ZeroAddress ||
    normalized === NATIVE_TOKEN_PLACEHOLDER_ADDRESS
  );
};

const sumGasFees = (
  fees: Array<GasFeeEstimationBase | undefined>,
): GasFeeEstimationBase | undefined => {
  const validFees = fees.filter(
    (fee): fee is GasFeeEstimationBase =>
      !!fee && !GasFeeUtils.isGasFeeEstimateInvalid(fee),
  );
  if (validFees.length === 0) {
    return undefined;
  }

  const totalEstimatedFeeInEth = validFees.reduce(
    (total, fee) => total.add(fee.estimatedFeeInEth),
    new Decimal(0),
  );

  return {
    ...validFees[validFees.length - 1],
    estimatedFeeInEth: totalEstimatedFeeInEth,
    maxFeeInEth: validFees.reduce(
      (total, fee) => total.add(fee.maxFeeInEth),
      new Decimal(0),
    ),
    estimatedFeeUSD: validFees.reduce(
      (total, fee) => total.add(fee.estimatedFeeUSD),
      new Decimal(0),
    ),
    maxFeeUSD: validFees.reduce(
      (total, fee) => total.add(fee.maxFeeUSD),
      new Decimal(0),
    ),
  };
};

const resolvePortfolioSwapFromTokenInfo = (
  chain: EvmChain,
  fromAsset: PortfolioCanonicalAsset | null | undefined,
): EvmSmartContractInfoNative | EvmSmartContractInfoErc20 => {
  if (!fromAsset?.address || fromAsset.isNative) {
    return EvmTokensUtils.buildFallbackNativeTokenInfo(chain);
  }

  return {
    type: EVMSmartContractType.ERC20,
    contractAddress: fromAsset.address,
    decimals: fromAsset.decimals ?? 18,
    symbol: fromAsset.symbol,
    name: fromAsset.name ?? fromAsset.symbol,
    logo: fromAsset.logoUrl ?? '',
    chainId: chain.chainId,
    backgroundColor: '',
    coingeckoId: '',
    priceUsd: fromAsset.priceUsd ?? null,
    possibleSpam: false,
    verifiedContract: true,
    validated: 0,
    isProxy: false,
    proxyTarget: null,
  };
};

const resolveLiFiSwapFromTokenInfo = (
  chain: EvmChain,
  token: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    logoURI?: string;
  },
): EvmSmartContractInfoNative | EvmSmartContractInfoErc20 => {
  if (isNativeSwapTokenAddress(token.address)) {
    return EvmTokensUtils.buildFallbackNativeTokenInfo(chain);
  }

  return {
    type: EVMSmartContractType.ERC20,
    contractAddress: token.address,
    decimals: token.decimals,
    symbol: token.symbol,
    name: token.name,
    logo: token.logoURI ?? '',
    chainId: chain.chainId,
    backgroundColor: '',
    coingeckoId: '',
    priceUsd: null,
    possibleSpam: false,
    verifiedContract: true,
    validated: 0,
    isProxy: false,
    proxyTarget: null,
  };
};

const getEvmSwapConfirmationBalanceInfo = async ({
  walletAddress,
  chain,
  fromTokenInfo,
  swapAmount,
  swapGasFee,
  approveGasFee,
  prefetchedMainTokenInfo,
}: {
  walletAddress: string;
  chain: EvmChain;
  fromTokenInfo: EvmSmartContractInfoNative | EvmSmartContractInfoErc20;
  swapAmount: number;
  swapGasFee?: GasFeeEstimationBase;
  approveGasFee?: GasFeeEstimationBase;
  prefetchedMainTokenInfo?: EvmSmartContractInfoNative;
}): Promise<BalanceInfo> =>
  EvmTokensUtils.getBalanceInfo(
    walletAddress,
    chain,
    fromTokenInfo,
    swapAmount,
    sumGasFees([approveGasFee, swapGasFee]),
    fromTokenInfo.type === EVMSmartContractType.ERC20
      ? prefetchedMainTokenInfo
      : undefined,
  );

export const EvmSwapConfirmationBalanceUtils = {
  getEvmSwapConfirmationBalanceInfo,
  isNativeSwapTokenAddress,
  resolveLiFiSwapFromTokenInfo,
  resolvePortfolioSwapFromTokenInfo,
  sumGasFees,
};
