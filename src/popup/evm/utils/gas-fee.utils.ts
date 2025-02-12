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
import { SVGIcons } from 'src/common-ui/icons.enum';

const getGasFeeEstimations = async (chain: Chain) => {
  return await KeychainApi.get(`evm/gasPriceEstimate/${chain.chainId}`);
};

const estimate = async (
  chain: EvmChain,
  wallet: HDNodeWallet,
  type: EvmTransactionType,
  gasLimit?: number,
  transactionData?: ProviderTransactionData,
): Promise<FullGasFeeEstimation> => {
  const estimates = await getGasFeeEstimations(chain);
  if (!gasLimit) {
    gasLimit = Number(
      await EthersUtils.getGasLimit(
        chain,
        wallet,
        transactionData?.abi,
        transactionData?.method,
        transactionData?.args,
        transactionData?.data,
        transactionData?.to,
      ),
    );
  }

  const maxLow = new Decimal(Number(estimates.low.suggestedMaxFeePerGas))
    .mul(Decimal.div(Number(gasLimit), 1000000))
    .div(1000)
    .toNumber();
  const maxMedium = new Decimal(Number(estimates.medium.suggestedMaxFeePerGas))
    .mul(Decimal.div(Number(gasLimit), 1000000))
    .div(1000)
    .toNumber();
  const maxAggressive = new Decimal(
    Number(estimates.high.suggestedMaxFeePerGas),
  )
    .mul(Decimal.div(Number(gasLimit), 1000000))
    .div(1000)
    .toNumber();
  const low = new Decimal(
    Number(estimates.low.suggestedMaxPriorityFeePerGas) +
      Number(estimates.estimatedBaseFee),
  )
    .mul(Decimal.div(Number(gasLimit), 1000000))
    .div(1000)
    .toNumber();
  const medium = new Decimal(
    Number(estimates.medium.suggestedMaxPriorityFeePerGas) +
      Number(estimates.estimatedBaseFee),
  )
    .mul(Decimal.div(Number(gasLimit), 1000000))
    .div(1000)
    .toNumber();
  const aggressive = new Decimal(
    Number(estimates.high.suggestedMaxPriorityFeePerGas) +
      Number(estimates.estimatedBaseFee),
  )
    .mul(Decimal.div(Number(gasLimit), 1000000))
    .div(1000)
    .toNumber();

  const fullEstimation: FullGasFeeEstimation = {
    suggested: {
      type: type,
      estimatedFee: low,
      maxFee: maxLow,
      estimatedMaxDuration: estimates.low.maxWaitTimeEstimate / 1000,
      priorityFee: estimates.low.suggestedMaxPriorityFeePerGas,
      maxFeePerGas: Number(estimates.low.suggestedMaxFeePerGas),
      gasPrice: Number(estimates.low.suggestedMaxFeePerGas),
      gasLimit: Number(gasLimit),
      icon: SVGIcons.EVM_GAS_FEE_LOW,
      name: 'popup_html_evm_custom_gas_fee_low',
    },
    low: {
      type: type,
      estimatedFee: low,
      maxFee: maxLow,
      estimatedMaxDuration: estimates.low.maxWaitTimeEstimate / 1000,
      priorityFee: estimates.low.suggestedMaxPriorityFeePerGas,
      maxFeePerGas: Number(estimates.low.suggestedMaxFeePerGas),
      gasPrice: Number(estimates.low.suggestedMaxFeePerGas),
      gasLimit: Number(gasLimit),
      icon: SVGIcons.EVM_GAS_FEE_LOW,
      name: 'popup_html_evm_custom_gas_fee_low',
    },
    medium: {
      type: type,
      estimatedFee: medium,
      maxFee: maxMedium,
      estimatedMaxDuration: estimates.medium.maxWaitTimeEstimate / 1000,
      priorityFee: estimates.medium.suggestedMaxPriorityFeePerGas,
      maxFeePerGas: Number(estimates.medium.suggestedMaxFeePerGas),
      gasPrice: Number(estimates.medium.suggestedMaxFeePerGas),
      gasLimit: Number(gasLimit),
      icon: SVGIcons.EVM_GAS_FEE_MEDIUM,
      name: 'popup_html_evm_custom_gas_fee_medium',
    },
    aggressive: {
      type: type,
      estimatedFee: aggressive,
      maxFee: maxAggressive,
      estimatedMaxDuration: estimates.high.maxWaitTimeEstimate / 1000,
      priorityFee: estimates.high.suggestedMaxPriorityFeePerGas,
      maxFeePerGas: Number(estimates.high.suggestedMaxFeePerGas),
      gasPrice: Number(estimates.high.suggestedMaxFeePerGas),
      gasLimit: Number(gasLimit),
      icon: SVGIcons.EVM_GAS_FEE_HIGH,
      name: 'popup_html_evm_custom_gas_fee_aggresive',
    },
    custom: {
      type: type,
      estimatedFee: -1,
      maxFee: -1,
      estimatedMaxDuration: -1,
      priorityFee: -1,
      maxFeePerGas: -1,
      gasPrice: -1,
      gasLimit: Number(gasLimit),
      icon: SVGIcons.EVM_GAS_FEE_CUSTOM,
      name: 'popup_html_evm_custom_gas_fee_custom',
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

  if (
    transactionData &&
    (transactionData.maxFeePerGas ||
      transactionData.maxPriorityFeePerGas ||
      transactionData.gasPrice)
  ) {
    fullEstimation.suggestedByDApp =
      await createDAppSuggestionFromTransactionData(
        transactionData,
        gasLimit!,
        fullEstimation,
      );
  }

  return fullEstimation;
};

const createDAppSuggestionFromTransactionData = async (
  transactionData: ProviderTransactionData,
  gasLimit: number,
  estimates: FullGasFeeEstimation,
) => {
  if (!transactionData.gasLimit) {
    transactionData.gasLimit = gasLimit;
  }

  let maxFee;
  let estimatedFee;

  switch (transactionData.type) {
    case EvmTransactionType.EIP_1559: {
      maxFee = new Decimal(Number(transactionData.maxFeePerGas!)).div(
        EvmFormatUtils.GWEI,
      );
      estimatedFee = new Decimal(
        Number(estimates.extraInfo.baseFee.estimated),
      ).add(
        new Decimal(Number(transactionData.maxPriorityFeePerGas!)).div(
          EvmFormatUtils.GWEI,
        ),
      );
      break;
    }
    case EvmTransactionType.LEGACY: {
      if (!transactionData.gasPrice) {
        transactionData.gasPrice = await EvmRequestsUtils.getGasPrice();
      }
      maxFee = new Decimal(Number(transactionData.gasPrice!)).div(
        EvmFormatUtils.GWEI,
      );
      estimatedFee = 0;
      break;
    }
    case EvmTransactionType.EIP_155: {
      maxFee = new Decimal(1); // TODO fix
      break;
    }
    case EvmTransactionType.EIP_4844: {
      maxFee = new Decimal(1); // TODO fix
      break;
    }
  }

  maxFee = maxFee
    .mul(Decimal.div(Number(transactionData.gasLimit), 1000000))
    .div(1000)
    .toNumber();

  estimatedFee = new Decimal(Number(estimatedFee))
    .mul(Decimal.div(Number(transactionData.gasLimit), 1000000))
    .div(1000)
    .toNumber();

  let estimatedMaxDuration = 0;
  if (maxFee >= estimates!.aggressive!.maxFee) {
    estimatedMaxDuration = estimates.aggressive.estimatedMaxDuration;
  } else if (maxFee >= estimates!.medium!.maxFee) {
    estimatedMaxDuration = estimates.medium.estimatedMaxDuration;
  } else {
    estimatedMaxDuration = estimates.low.estimatedMaxDuration;
  }

  return {
    type: transactionData.type,
    gasLimit: Number(transactionData.gasLimit),
    gasPrice: Number(transactionData.gasPrice) / EvmFormatUtils.GWEI,
    maxFeePerGas: Number(transactionData.maxFeePerGas) / EvmFormatUtils.GWEI,
    priorityFee:
      Number(transactionData.maxPriorityFeePerGas) / EvmFormatUtils.GWEI,
    estimatedFee: estimatedFee,
    maxFee: maxFee,
    estimatedMaxDuration: estimatedMaxDuration,
    icon: SVGIcons.EVM_GAS_FEE_SUGGESTED,
    name: 'popup_html_evm_suggested_by_dapp_gas_fee_custom',
  } as GasFeeEstimationBase;
};

export const GasFeeUtils = {
  estimate,
};
