import { EvmTokenInfoShort } from '@popup/evm/interfaces/evm-tokens.interface';
import {
  EvmTransactionType,
  ProviderTransactionData,
} from '@popup/evm/interfaces/evm-transactions.interface';
import {
  EvmFeeTrend,
  FullGasFeeEstimation,
  GasFeeEstimationBase,
} from '@popup/evm/interfaces/gas-fee.interface';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmRequestsUtils } from '@popup/evm/utils/evm-requests.utils';
import { EvmFormatUtils } from '@popup/evm/utils/format.utils';
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
  type: EvmTransactionType,
  gasLimit?: number,
  transactionData?: ProviderTransactionData,
): Promise<FullGasFeeEstimation> => {
  const estimates = await getGasFeeEstimations(chain);

  console.log({ estimates });
  if (!gasLimit)
    gasLimit = await EthersUtils.getGasLimit(
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

  const fullEstimation: FullGasFeeEstimation = {
    suggested: {
      type: type,
      estimatedFee: low,
      estimatedMaxDuration: estimates.low.maxWaitTimeEstimate / 1000,
      priorityFee: estimates.low.suggestedMaxPriorityFeePerGas,
      maxFeePerGas: Number(estimates.low.suggestedMaxFeePerGas),
      gasPrice: Number(estimates.low.suggestedMaxFeePerGas),
      gasLimit: Number(gasLimit),
    },
    low: {
      type: type,
      estimatedFee: low,
      estimatedMaxDuration: estimates.low.maxWaitTimeEstimate / 1000,
      priorityFee: estimates.low.suggestedMaxPriorityFeePerGas,
      maxFeePerGas: Number(estimates.low.suggestedMaxFeePerGas),
      gasPrice: Number(estimates.low.suggestedMaxFeePerGas),
      gasLimit: Number(gasLimit),
    },
    medium: {
      type: type,
      estimatedFee: medium,
      estimatedMaxDuration: estimates.medium.maxWaitTimeEstimate / 1000,
      priorityFee: estimates.medium.suggestedMaxPriorityFeePerGas,
      maxFeePerGas: Number(estimates.medium.suggestedMaxFeePerGas),
      gasPrice: Number(estimates.medium.suggestedMaxFeePerGas),
      gasLimit: Number(gasLimit),
    },
    max: {
      type: type,
      estimatedFee: aggressive,
      estimatedMaxDuration: estimates.high.maxWaitTimeEstimate / 1000,
      priorityFee: estimates.high.suggestedMaxPriorityFeePerGas,
      maxFeePerGas: Number(estimates.high.suggestedMaxFeePerGas),
      gasPrice: Number(estimates.high.suggestedMaxFeePerGas),
      gasLimit: Number(gasLimit),
    },
    aggressive: {
      type: type,
      estimatedFee: aggressive,
      estimatedMaxDuration: estimates.high.maxWaitTimeEstimate / 1000,
      priorityFee: estimates.high.suggestedMaxPriorityFeePerGas,
      maxFeePerGas: Number(estimates.high.suggestedMaxFeePerGas),
      gasPrice: Number(estimates.high.suggestedMaxFeePerGas),
      gasLimit: Number(gasLimit),
    },
    custom: {
      type: type,
      estimatedFee: -1,
      estimatedMaxDuration: -1,
      priorityFee: -1,
      maxFeePerGas: -1,
      gasPrice: -1,
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

  if (transactionData) {
    fullEstimation.suggestedByDApp =
      await createDAppSuggestionFromTransactionData(transactionData, gasLimit);
  }

  return fullEstimation;
};

const createDAppSuggestionFromTransactionData = async (
  transactionData: ProviderTransactionData,
  gasLimit: number,
) => {
  if (!transactionData.gasLimit) {
    transactionData.gasLimit = gasLimit;
  }

  let fee = 0;
  let estimatedMaxDuration = 0;

  let test;

  console.log('Before calculation', { transactionData, gasLimit });

  switch (transactionData.type) {
    case EvmTransactionType.EIP_1559: {
      fee = EvmFormatUtils.etherToGwei(
        transactionData.gasLimit * Number(transactionData.maxFeePerGas!),
      );
      test = Number(transactionData.maxFeePerGas!);
      break;
    }
    case EvmTransactionType.LEGACY: {
      if (!transactionData.gasPrice) {
        transactionData.gasPrice = await EvmRequestsUtils.getGasPrice();
      }
      fee = EvmFormatUtils.etherToGwei(
        transactionData.gasLimit * Number(transactionData.gasPrice!),
      );
      test = Number(transactionData.gasPrice!);
      break;
    }
  }

  const estimatedFee = new Decimal(Number(test))
    .mul(Decimal.div(Number(transactionData.gasLimit), 1000000))
    .div(1000)
    .toNumber();

  console.log({ test, estimatedFee });

  return {
    type: transactionData.type,
    gasLimit: transactionData.gasLimit,
    gasPrice: transactionData.gasPrice,
    maxFeePerGas: transactionData.maxFeePerGas,
    priorityFee: transactionData.maxPriorityFeePerGas,
    estimatedFee: estimatedFee,
    estimatedMaxDuration: estimatedMaxDuration,
  } as GasFeeEstimationBase;
};

export const GasFeeUtils = {
  estimate,
};
