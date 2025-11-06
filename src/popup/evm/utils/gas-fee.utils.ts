import {
  EvmTransactionType,
  ProviderTransactionData,
} from '@popup/evm/interfaces/evm-transactions.interface';
import {
  EvmFeeTrend,
  FullGasFeeEstimation,
  GasFeeEstimationBase,
} from '@popup/evm/interfaces/gas-fee.interface';
import { EvmPrices } from '@popup/evm/reducers/prices.reducer';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { EvmRequestsUtils } from '@popup/evm/utils/evm-requests.utils';
import { Chain, EvmChain } from '@popup/multichain/interfaces/chains.interface';
import Decimal from 'decimal.js';
import { HDNodeWallet } from 'ethers';
import { KeychainApi } from 'src/api/keychain';
import { SVGIcons } from 'src/common-ui/icons.enum';

const getGasFeeEstimations = async (chain: Chain) => {
  const result = await KeychainApi.get(`evm/gasPriceEstimate/${chain.chainId}`);
  return result;
};

const estimate = async (
  chain: EvmChain,
  wallet: HDNodeWallet,
  type: EvmTransactionType,
  evmPrices: EvmPrices,
  gasLimit?: number,
  transactionData?: ProviderTransactionData,
): Promise<FullGasFeeEstimation> => {
  let estimates;
  estimates = await getGasFeeEstimations(chain);

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

  console.log(estimates);

  if (!estimates || !estimates.low) {
    const [maxPriorityFeePerGas, gasPrice, baseFee] = await Promise.all([
      EvmRequestsUtils.getMaxPriorityFeePerGas(),
      EvmRequestsUtils.getGasPrice(),
      EvmRequestsUtils.getBaseFee(),
    ]);
    console.log(maxPriorityFeePerGas, gasPrice, baseFee);
    const maxFeePerGas = baseFee
      ? new Decimal(maxPriorityFeePerGas).add(new Decimal(baseFee))
      : new Decimal(gasPrice);

    return {
      custom: {
        type: type,
        estimatedFee: new Decimal(-1),
        maxFee: new Decimal(-1),
        estimatedFeeUSD: new Decimal(-1),
        maxFeeUSD: new Decimal(-1),
        estimatedMaxDuration: new Decimal(-1),
        priorityFee: new Decimal(maxPriorityFeePerGas),
        maxFeePerGas: new Decimal(maxFeePerGas),
        gasPrice: new Decimal(gasPrice),
        gasLimit: new Decimal(gasLimit),
        icon: SVGIcons.EVM_GAS_FEE_CUSTOM,
        name: 'popup_html_evm_custom_gas_fee_custom',
      },
    };
  }

  const price = new Decimal(evmPrices[chain.mainToken.toLowerCase()]?.usd ?? 0);

  const lowPriorityFee = Math.max(
    Number(estimates.low.suggestedMaxPriorityFeePerGas),
    Number(estimates.latestPriorityFeeRange[0]),
  );
  const mediumPriorityFee = Math.max(
    Number(estimates.medium.suggestedMaxPriorityFeePerGas),
    Number(estimates.latestPriorityFeeRange[0]),
  );
  const aggressivePriorityFee = Math.max(
    Number(estimates.high.suggestedMaxPriorityFeePerGas),
    Number(estimates.latestPriorityFeeRange[0]),
  );

  const maxLow = new Decimal(Number(estimates.low.suggestedMaxFeePerGas))
    .mul(Decimal.div(Number(gasLimit), 1000000))
    .div(1000);
  const maxMedium = new Decimal(Number(estimates.medium.suggestedMaxFeePerGas))
    .mul(Decimal.div(Number(gasLimit), 1000000))
    .div(1000);
  const maxAggressive = new Decimal(
    Number(estimates.high.suggestedMaxFeePerGas),
  )
    .mul(Decimal.div(Number(gasLimit), 1000000))
    .div(1000);
  const low = new Decimal(lowPriorityFee + Number(estimates.estimatedBaseFee))
    .mul(Decimal.div(Number(gasLimit), 1000000))
    .div(1000);
  const medium = new Decimal(
    mediumPriorityFee + Number(estimates.estimatedBaseFee),
  )
    .mul(Decimal.div(Number(gasLimit), 1000000))
    .div(1000);
  const aggressive = new Decimal(
    aggressivePriorityFee + Number(estimates.estimatedBaseFee),
  )
    .mul(Decimal.div(Number(gasLimit), 1000000))
    .div(1000);

  const fullEstimation: FullGasFeeEstimation = {
    suggested: {
      type: type,
      estimatedFee: new Decimal(low),
      estimatedFeeUSD: low.mul(price),
      maxFee: maxLow,
      maxFeeUSD: maxLow.mul(price),
      estimatedMaxDuration: new Decimal(
        estimates.low.maxWaitTimeEstimate / 1000,
      ),
      priorityFee: new Decimal(lowPriorityFee),
      maxFeePerGas: new Decimal(estimates.low.suggestedMaxFeePerGas),
      gasPrice: new Decimal(estimates.low.suggestedMaxFeePerGas),
      gasLimit: new Decimal(gasLimit),
      icon: SVGIcons.EVM_GAS_FEE_LOW,
      name: 'popup_html_evm_custom_gas_fee_low',
    },
    low: {
      type: type,
      estimatedFee: new Decimal(low),
      estimatedFeeUSD: low.mul(price),
      maxFee: maxLow,
      maxFeeUSD: maxLow.mul(price),
      estimatedMaxDuration: new Decimal(
        estimates.low.maxWaitTimeEstimate / 1000,
      ),
      priorityFee: new Decimal(lowPriorityFee),
      maxFeePerGas: new Decimal(estimates.low.suggestedMaxFeePerGas),
      gasPrice: new Decimal(estimates.low.suggestedMaxFeePerGas),
      gasLimit: new Decimal(gasLimit),
      icon: SVGIcons.EVM_GAS_FEE_LOW,
      name: 'popup_html_evm_custom_gas_fee_low',
    },
    medium: {
      type: type,
      estimatedFee: new Decimal(medium),
      estimatedFeeUSD: medium.mul(price),
      maxFee: maxMedium,
      maxFeeUSD: maxMedium.mul(price),
      estimatedMaxDuration: new Decimal(
        estimates.medium.maxWaitTimeEstimate / 1000,
      ),
      priorityFee: new Decimal(mediumPriorityFee),
      maxFeePerGas: new Decimal(estimates.medium.suggestedMaxFeePerGas),
      gasPrice: new Decimal(estimates.medium.suggestedMaxFeePerGas),
      gasLimit: new Decimal(gasLimit),
      icon: SVGIcons.EVM_GAS_FEE_MEDIUM,
      name: 'popup_html_evm_custom_gas_fee_medium',
    },
    aggressive: {
      type: type,
      estimatedFee: new Decimal(aggressive),
      estimatedFeeUSD: aggressive.mul(price),
      maxFee: maxAggressive,
      maxFeeUSD: maxAggressive.mul(price),
      estimatedMaxDuration: new Decimal(
        estimates.high.maxWaitTimeEstimate / 1000,
      ),
      priorityFee: new Decimal(aggressivePriorityFee),
      maxFeePerGas: new Decimal(estimates.high.suggestedMaxFeePerGas),
      gasPrice: new Decimal(estimates.high.suggestedMaxFeePerGas),
      gasLimit: new Decimal(gasLimit),
      icon: SVGIcons.EVM_GAS_FEE_HIGH,
      name: 'popup_html_evm_custom_gas_fee_aggresive',
    },
    custom: {
      type: type,
      estimatedFee: new Decimal(-1),
      maxFee: new Decimal(-1),
      estimatedFeeUSD: new Decimal(0),
      maxFeeUSD: new Decimal(0),
      estimatedMaxDuration: new Decimal(-1),
      priorityFee: new Decimal(-1),
      maxFeePerGas: new Decimal(-1),
      gasPrice: new Decimal(-1),
      gasLimit: new Decimal(gasLimit),
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

  let maxFee: Decimal;
  let estimatedFee: Decimal = new Decimal(0);

  switch (transactionData.type) {
    case EvmTransactionType.EIP_1559: {
      maxFee = new Decimal(Number(transactionData.maxFeePerGas!)).div(
        EvmFormatUtils.GWEI,
      );
      estimatedFee = new Decimal(
        Number(estimates?.extraInfo?.baseFee.estimated),
      ).add(
        new Decimal(Number(transactionData.maxPriorityFeePerGas!)).div(
          EvmFormatUtils.GWEI,
        ),
      );
      break;
    }
    case EvmTransactionType.EIP_155:
    case EvmTransactionType.LEGACY: {
      if (!transactionData.gasPrice) {
        transactionData.gasPrice = (
          await EvmRequestsUtils.getGasPrice()
        ).toString();
      }
      maxFee = new Decimal(Number(transactionData.gasPrice!)).div(
        EvmFormatUtils.GWEI,
      );
      estimatedFee = new Decimal(0);
      break;
    }
    case EvmTransactionType.EIP_4844: {
      maxFee = new Decimal(1); // TODO fix
      break;
    }
  }

  maxFee = maxFee
    .mul(Decimal.div(Number(transactionData.gasLimit), 1000000))
    .div(1000);

  estimatedFee = new Decimal(Number(estimatedFee ?? 0))
    .mul(Decimal.div(Number(transactionData.gasLimit), 1000000))
    .div(1000);
  let estimatedMaxDuration = new Decimal(-1);
  if (
    estimates?.aggressive?.maxFee &&
    maxFee.greaterThanOrEqualTo(estimates.aggressive.maxFee)
  ) {
    estimatedMaxDuration = estimates.aggressive.estimatedMaxDuration;
  } else if (
    estimates?.medium?.maxFee &&
    maxFee.greaterThanOrEqualTo(estimates.medium.maxFee)
  ) {
    estimatedMaxDuration = estimates.medium.estimatedMaxDuration;
  } else if (
    estimates?.low?.maxFee &&
    maxFee.greaterThanOrEqualTo(estimates.low.maxFee)
  ) {
    estimatedMaxDuration = estimates.low.estimatedMaxDuration;
  }

  return {
    type: transactionData.type,
    gasLimit: new Decimal(transactionData.gasLimit),
    gasPrice: new Decimal(Number(transactionData.gasPrice)).div(
      EvmFormatUtils.GWEI,
    ),
    maxFeePerGas: new Decimal(Number(transactionData.maxFeePerGas)).div(
      EvmFormatUtils.GWEI,
    ),
    priorityFee: new Decimal(Number(transactionData.maxPriorityFeePerGas)).div(
      EvmFormatUtils.GWEI,
    ),
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
