import { EvmTokenInfoShort } from '@popup/evm/interfaces/evm-tokens.interface';
import {
  EvmFeeTrend,
  FullGasFeeEstimation,
} from '@popup/evm/interfaces/gas-fee.interface';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { Chain, EvmChain } from '@popup/multichain/interfaces/chains.interface';
import Decimal from 'decimal.js';
import { HDNodeWallet } from 'ethers';
import { KeychainApi } from 'src/api/keychain';

const getGasFeeEstimations = async (chain: Chain) => {
  return await KeychainApi.get(`evm/gasPriceEstimate/${chain.chainId}`);
};

const estimate = async (
  chain: EvmChain,
  tokenInfo: EvmTokenInfoShort,
  receiverAddress: string,
  amount: number,
  wallet: HDNodeWallet,
): Promise<FullGasFeeEstimation> => {
  const estimates = await getGasFeeEstimations(chain);

  const gasLimit = await EthersUtils.getGasLimit(
    chain,
    tokenInfo,
    receiverAddress,
    amount,
    wallet,
  );

  const low = new Decimal(Number(estimates.low.suggestedMaxFeePerGas))
    .mul(Decimal.div(Number(gasLimit), 1000000))
    .div(1000)
    .toNumber();
  const medium = new Decimal(Number(estimates.medium.suggestedMaxFeePerGas))
    .mul(Decimal.div(Number(gasLimit), 1000000))
    .div(1000)
    .toNumber();
  const aggressive = new Decimal(Number(estimates.high.suggestedMaxFeePerGas))
    .mul(Decimal.div(Number(gasLimit), 1000000))
    .div(1000)
    .toNumber();

  return {
    suggested: {
      estimatedFee: low,
      estimatedMaxDuration: estimates.low.maxWaitTimeEstimate / 1000,
      priorityFee: estimates.low.suggestedMaxPriorityFeePerGas,
      maxFeePerGas: Number(estimates.low.suggestedMaxFeePerGas),
      gasLimit: Number(gasLimit),
    },
    low: {
      estimatedFee: low,
      estimatedMaxDuration: estimates.low.maxWaitTimeEstimate / 1000,
      priorityFee: estimates.low.suggestedMaxPriorityFeePerGas,
      maxFeePerGas: Number(estimates.low.suggestedMaxFeePerGas),
      gasLimit: Number(gasLimit),
    },
    medium: {
      estimatedFee: medium,
      estimatedMaxDuration: estimates.medium.maxWaitTimeEstimate / 1000,
      priorityFee: estimates.medium.suggestedMaxPriorityFeePerGas,
      maxFeePerGas: Number(estimates.medium.suggestedMaxFeePerGas),
      gasLimit: Number(gasLimit),
    },
    max: {
      estimatedFee: aggressive,
      estimatedMaxDuration: estimates.high.maxWaitTimeEstimate / 1000,
      priorityFee: estimates.high.suggestedMaxPriorityFeePerGas,
      maxFeePerGas: Number(estimates.high.suggestedMaxFeePerGas),
      gasLimit: Number(gasLimit),
    },
    aggressive: {
      estimatedFee: aggressive,
      estimatedMaxDuration: estimates.high.maxWaitTimeEstimate / 1000,
      priorityFee: estimates.high.suggestedMaxPriorityFeePerGas,
      maxFeePerGas: Number(estimates.high.suggestedMaxFeePerGas),
      gasLimit: Number(gasLimit),
    },
    custom: {
      estimatedFee: -1,
      estimatedMaxDuration: -1,
      priorityFee: -1,
      maxFeePerGas: -1,
      gasLimit: Number(gasLimit),
    },
    extraInfo: {
      baseFee: {
        baseFeeRange: {
          min: Number(estimates.historicalBaseFeeRange[0]).toFixed(2),
          max: Number(estimates.historicalBaseFeeRange[1]).toFixed(2),
        },
        estimated: Number(estimates.estimatedBaseFee).toFixed(2),
      },
      priorityFee: {
        history: {
          min: Number(estimates.historicalPriorityFeeRange[0]).toFixed(2),
          max: Number(estimates.historicalPriorityFeeRange[1]).toFixed(2),
        },
        latest: {
          min: Number(estimates.latestPriorityFeeRange[0]).toFixed(2),
          max: Number(estimates.latestPriorityFeeRange[1]).toFixed(2),
        },
      },
      trends: {
        baseFee: estimates.baseFeeTrend as EvmFeeTrend,
        priorityFee: estimates.priorityFeeTrend as EvmFeeTrend,
      },
    },
  };
};

export const GasFeeUtils = {
  estimate,
};
