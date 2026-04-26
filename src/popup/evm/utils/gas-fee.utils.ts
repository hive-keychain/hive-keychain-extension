import { EvmLightNodeApi } from '@api/evm-light-node';
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
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { EvmRequestsUtils } from '@popup/evm/utils/evm-requests.utils';
import { Chain, EvmChain } from '@popup/multichain/interfaces/chains.interface';
import Decimal from 'decimal.js';
import { HDNodeWallet } from 'ethers';
import { SVGIcons } from 'src/common-ui/icons.enum';
import Logger from 'src/utils/logger.utils';

/** Above ~200M is never a real per-tx gas limit; larger values are usually mis-encoded or malicious. */
const MAX_PLAUSIBLE_DAPP_GAS_LIMIT = 200_000_000;
const MIN_PLAUSIBLE_DAPP_GAS_LIMIT = 21_000;

const isPlausibleGasLimit = (n: number | undefined | null): n is number => {
  return (
    n != null &&
    Number.isFinite(n) &&
    n >= MIN_PLAUSIBLE_DAPP_GAS_LIMIT &&
    n <= MAX_PLAUSIBLE_DAPP_GAS_LIMIT
  );
};

const getGasFeeEstimations = async (chain: Chain) => {
  const result = await EvmLightNodeApi.get(
    `gas-oracle/${Number(chain.chainId)}`,
  );
  return result;
};

const estimate = async (
  chain: EvmChain,
  wallet: HDNodeWallet,
  type: EvmTransactionType,
  mainTokenPrice: number,
  gasLimit?: number,
  transactionData?: ProviderTransactionData,
): Promise<FullGasFeeEstimation> => {
  let estimates;
  try {
    estimates = await getGasFeeEstimations(chain);
  } catch (error) {
    Logger.error('Error in gas fee estimation', error);
  }

  const price = new Decimal(mainTokenPrice);
  if (gasLimit != null && !isPlausibleGasLimit(gasLimit)) {
    gasLimit = undefined;
  }
  if (!gasLimit) {
    gasLimit = Number(
      await EthersUtils.getGasLimit(
        chain,
        wallet,
        transactionData?.abi,
        transactionData?.signature ?? transactionData?.method,
        transactionData?.args,
        transactionData?.data,
        transactionData?.to,
        transactionData?.value,
      ),
    );
  }

  if (!estimates || !estimates.low) {
    const provider = await EthersUtils.getProvider(chain);

    const [feeDataResult, maxPriorityFeePerGasRpc] = await Promise.all([
      provider.getFeeData(),
      EvmRequestsUtils.getMaxPriorityFeePerGas(),
    ]);

    const feeData = feeDataResult.toJSON();

    if (!feeData.maxPriorityFeePerGas) {
      feeData.maxPriorityFeePerGas = maxPriorityFeePerGasRpc;
    }

    if (!feeData.maxFeePerGas) {
      feeData.maxFeePerGas = feeData.maxPriorityFeePerGas;
    }

    const maxPriorityFeePerGasInGwei = EvmFormatUtils.weiToGwei(
      new Decimal(Number(feeData.maxPriorityFeePerGas)),
    );
    const gasPriceInGwei = EvmFormatUtils.weiToGwei(
      new Decimal(Number(feeData.gasPrice)),
    );

    const maxFeePerGasInGwei = EvmFormatUtils.weiToGwei(
      new Decimal(Number(feeData.maxFeePerGas)),
    );

    const baseFeeInGwei = maxFeePerGasInGwei.sub(maxPriorityFeePerGasInGwei);

    const maxFeePerGasInWei = EvmFormatUtils.gweiToWei(maxFeePerGasInGwei);

    const maxFee = maxFeePerGasInWei
      .mul(gasLimit)
      .div(new Decimal(EvmFormatUtils.WEI));

    const valueUSD = maxFee.mul(price);

    const feeResult: FullGasFeeEstimation = {
      custom: {
        type: type,
        estimatedFeeInEth: maxFee,
        maxFeeInEth: maxFee,
        estimatedFeeUSD: valueUSD,
        maxFeeUSD: valueUSD,
        estimatedMaxDuration: new Decimal(-1),
        priorityFeeInGwei: new Decimal(maxPriorityFeePerGasInGwei),
        maxFeePerGasInGwei: new Decimal(maxFeePerGasInGwei),
        baseFeePerGasInGwei: new Decimal(baseFeeInGwei),
        gasPriceInGwei: new Decimal(gasPriceInGwei),
        gasLimit: new Decimal(gasLimit),
        icon: SVGIcons.EVM_GAS_FEE_CUSTOM,
        name: 'popup_html_evm_custom_gas_fee_custom',
      },
    };

    if (
      transactionData &&
      (transactionData.gasPrice ||
        (transactionData.maxPriorityFeePerGas && transactionData.maxFeePerGas))
    ) {
      feeResult.suggestedByDApp = await createDAppSuggestionFromTransactionData(
        transactionData,
        gasLimit!,
        feeResult,
        price,
      );
    }

    return feeResult;
  }

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
      estimatedFeeInEth: new Decimal(low),
      estimatedFeeUSD: low.mul(price),
      maxFeeInEth: maxLow,
      maxFeeUSD: maxLow.mul(price),
      estimatedMaxDuration: new Decimal(
        estimates.low.maxWaitTimeEstimate / 1000,
      ),
      priorityFeeInGwei: new Decimal(lowPriorityFee),
      maxFeePerGasInGwei: new Decimal(estimates.low.suggestedMaxFeePerGas),
      gasPriceInGwei: new Decimal(estimates.low.suggestedMaxFeePerGas),
      gasLimit: new Decimal(gasLimit),
      icon: SVGIcons.EVM_GAS_FEE_LOW,
      name: 'popup_html_evm_custom_gas_fee_low',
    },
    low: {
      type: type,
      estimatedFeeInEth: new Decimal(low),
      estimatedFeeUSD: low.mul(price),
      maxFeeInEth: maxLow,
      maxFeeUSD: maxLow.mul(price),
      estimatedMaxDuration: new Decimal(
        estimates.low.maxWaitTimeEstimate / 1000,
      ),
      priorityFeeInGwei: new Decimal(lowPriorityFee),
      maxFeePerGasInGwei: new Decimal(estimates.low.suggestedMaxFeePerGas),
      gasPriceInGwei: new Decimal(estimates.low.suggestedMaxFeePerGas),
      gasLimit: new Decimal(gasLimit),
      icon: SVGIcons.EVM_GAS_FEE_LOW,
      name: 'popup_html_evm_custom_gas_fee_low',
    },
    medium: {
      type: type,
      estimatedFeeInEth: new Decimal(medium),
      estimatedFeeUSD: medium.mul(price),
      maxFeeInEth: maxMedium,
      maxFeeUSD: maxMedium.mul(price),
      estimatedMaxDuration: new Decimal(
        estimates.medium.maxWaitTimeEstimate / 1000,
      ),
      priorityFeeInGwei: new Decimal(mediumPriorityFee),
      maxFeePerGasInGwei: new Decimal(estimates.medium.suggestedMaxFeePerGas),
      gasPriceInGwei: new Decimal(estimates.medium.suggestedMaxFeePerGas),
      gasLimit: new Decimal(gasLimit),
      icon: SVGIcons.EVM_GAS_FEE_MEDIUM,
      name: 'popup_html_evm_custom_gas_fee_medium',
    },
    aggressive: {
      type: type,
      estimatedFeeInEth: new Decimal(aggressive),
      estimatedFeeUSD: aggressive.mul(price),
      maxFeeInEth: maxAggressive,
      maxFeeUSD: maxAggressive.mul(price),
      estimatedMaxDuration: new Decimal(
        estimates.high.maxWaitTimeEstimate / 1000,
      ),
      priorityFeeInGwei: new Decimal(aggressivePriorityFee),
      maxFeePerGasInGwei: new Decimal(estimates.high.suggestedMaxFeePerGas),
      gasPriceInGwei: new Decimal(estimates.high.suggestedMaxFeePerGas),
      gasLimit: new Decimal(gasLimit),
      icon: SVGIcons.EVM_GAS_FEE_HIGH,
      name: 'popup_html_evm_custom_gas_fee_aggresive',
    },
    custom: {
      type: type,
      estimatedFeeInEth: new Decimal(-1),
      maxFeeInEth: new Decimal(-1),
      estimatedFeeUSD: new Decimal(0),
      maxFeeUSD: new Decimal(0),
      estimatedMaxDuration: new Decimal(-1),
      priorityFeeInGwei: new Decimal(-1),
      maxFeePerGasInGwei: new Decimal(-1),
      gasPriceInGwei: new Decimal(-1),
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
        price,
      );
  }
  return fullEstimation;
};

const createDAppSuggestionFromTransactionData = async (
  transactionData: ProviderTransactionData,
  gasLimit: number,
  estimates: FullGasFeeEstimation,
  mainTokenPrice: Decimal,
) => {
  const dappGasRaw =
    transactionData.gasLimit != null
      ? Number(transactionData.gasLimit)
      : undefined;
  if (transactionData.gasLimit == null || !isPlausibleGasLimit(dappGasRaw)) {
    transactionData.gasLimit = gasLimit;
  }
  const gasLimitToUse = Number(transactionData.gasLimit);

  let maxFee: Decimal;
  let estimatedFee: Decimal = new Decimal(0);

  switch (transactionData.type) {
    case EvmTransactionType.EIP_1559: {
      maxFee = new Decimal(Number(transactionData.maxFeePerGas!)).div(
        EvmFormatUtils.GWEI,
      );
      estimatedFee = new Decimal(
        Number(estimates?.extraInfo?.baseFee?.estimated ?? 0),
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

  maxFee = maxFee!
    .mul(Decimal.div(gasLimitToUse, 1000000))
    .div(1000);

  estimatedFee = new Decimal(Number(estimatedFee ?? 0))
    .mul(Decimal.div(gasLimitToUse, 1000000))
    .div(1000);
  let estimatedMaxDuration = new Decimal(-1);
  if (
    estimates?.aggressive?.maxFeeInEth &&
    maxFee.greaterThanOrEqualTo(estimates.aggressive.maxFeeInEth)
  ) {
    estimatedMaxDuration = estimates.aggressive.estimatedMaxDuration;
  } else if (
    estimates?.medium?.maxFeeInEth &&
    maxFee.greaterThanOrEqualTo(estimates.medium.maxFeeInEth)
  ) {
    estimatedMaxDuration = estimates.medium.estimatedMaxDuration;
  } else if (
    estimates?.low?.maxFeeInEth &&
    maxFee.greaterThanOrEqualTo(estimates.low.maxFeeInEth)
  ) {
    estimatedMaxDuration = estimates.low.estimatedMaxDuration;
  }

  return {
    type: transactionData.type,
    gasLimit: new Decimal(gasLimitToUse),
    gasPriceInGwei: new Decimal(Number(transactionData.gasPrice)).div(
      EvmFormatUtils.GWEI,
    ),
    maxFeePerGasInGwei: new Decimal(Number(transactionData.maxFeePerGas)).div(
      EvmFormatUtils.GWEI,
    ),
    priorityFeeInGwei: new Decimal(
      Number(transactionData.maxPriorityFeePerGas),
    ).div(EvmFormatUtils.GWEI),
    estimatedFeeInEth: estimatedFee,
    estimatedFeeUSD: estimatedFee.mul(mainTokenPrice),
    maxFeeInEth: maxFee,
    maxFeeUSD: maxFee.mul(mainTokenPrice),
    estimatedMaxDuration: estimatedMaxDuration,
    icon: SVGIcons.EVM_GAS_FEE_SUGGESTED,
    name: 'popup_html_evm_suggested_by_dapp_gas_fee_custom',
  } as GasFeeEstimationBase;
};

export const GasFeeUtils = {
  estimate,
};
