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
import { fetchGasOracle } from '@popup/evm/utils/evm-gas-oracle.utils';
import { EvmRequestsUtils } from '@popup/evm/utils/evm-requests.utils';
import {
  RpcGasFeeEstimator,
  RpcGasOracleEstimates,
} from '@popup/evm/utils/rpc-gas-fee-estimator.utils';
import { Chain, EvmChain } from '@popup/multichain/interfaces/chains.interface';
import Decimal from 'decimal.js';
import { SVGIcons } from 'src/common-ui/icons.enum';
import FormatUtils from 'src/utils/format.utils';
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
  if (chain.isCustom) {
    return null;
  }
  return fetchGasOracle(chain.chainId) as Promise<any>;
};

const isInvalidDecimal = (value?: Decimal) => !value || value.lte(0);

const isGasFeeEstimateInvalid = (fee?: GasFeeEstimationBase): boolean => {
  if (!fee) {
    return true;
  }
  if (
    isInvalidDecimal(fee.gasLimit) ||
    isInvalidDecimal(fee.estimatedFeeInEth) ||
    isInvalidDecimal(fee.maxFeeInEth)
  ) {
    return true;
  }

  switch (fee.type) {
    case EvmTransactionType.EIP_1559:
      return (
        isInvalidDecimal(fee.priorityFeeInGwei) ||
        isInvalidDecimal(fee.maxFeePerGasInGwei)
      );
    case EvmTransactionType.LEGACY:
    case EvmTransactionType.EIP_155:
      return isInvalidDecimal(fee.gasPriceInGwei);
    default:
      return (
        isInvalidDecimal(fee.priorityFeeInGwei) ||
        isInvalidDecimal(fee.gasPriceInGwei)
      );
  }
};

const hasDisplayableEstimatedFee = (fee: GasFeeEstimationBase) =>
  fee.estimatedFeeInEth.gt(0);

const hasDisplayableMaxFee = (fee: GasFeeEstimationBase) => fee.maxFeeInEth.gt(0);

const hasDisplayableDuration = (fee: GasFeeEstimationBase) =>
  fee.estimatedMaxDuration.gt(0);

type GasFeeDisplayMode = 'compact' | 'full';

const formatGasFeeValue = (
  value: Decimal,
  decimals = 8,
  mode: GasFeeDisplayMode = 'full',
): string => {
  const formattedValue = FormatUtils.formatCurrencyValue(
    value.toFixed(),
    decimals,
  );
  if (value.gt(0) && new Decimal(formattedValue.replace(/,/g, '')).isZero()) {
    if (mode === 'compact') {
      return '~0';
    }
    const minimumDisplayableValue = new Decimal(1).div(
      new Decimal(10).pow(decimals),
    );
    return `< ${FormatUtils.formatCurrencyValue(
      minimumDisplayableValue.toFixed(),
      decimals,
    )}`;
  }
  return formattedValue;
};

const feeFromGweiAndGasLimit = (gwei: number | string, gasLimit: number) => {
  return new Decimal(gwei)
    .mul(Decimal.div(gasLimit, 1_000_000))
    .div(1000);
};

const getBaseFeeInGwei = (
  estimates: RpcGasOracleEstimates,
): Decimal | undefined => {
  return estimates.estimatedBaseFee != null
    ? new Decimal(estimates.estimatedBaseFee)
    : undefined;
};

const isLegacyTransactionType = (type: EvmTransactionType) => {
  return (
    type === EvmTransactionType.LEGACY || type === EvmTransactionType.EIP_155
  );
};

const getTierEstimatedGasPriceInGwei = (
  tier: RpcGasOracleEstimates['low'],
  priorityFeeInGwei: number,
  baseFeeInGwei: Decimal | undefined,
  type: EvmTransactionType,
  minGasPriceInGwei?: Decimal,
) => {
  if (isLegacyTransactionType(type)) {
    return getCappedLegacyGasPriceInGwei(
      new Decimal(tier.suggestedMaxFeePerGas),
      minGasPriceInGwei,
    );
  }
  return new Decimal(priorityFeeInGwei).add(baseFeeInGwei ?? 0);
};

const getMinGasPriceInGwei = (
  estimates: RpcGasOracleEstimates,
  type: EvmTransactionType,
): Decimal | undefined => {
  if (!isLegacyTransactionType(type) || estimates.minGasPrice == null) {
    return undefined;
  }

  const minGasPriceInGwei = new Decimal(estimates.minGasPrice);
  return minGasPriceInGwei.gt(0) ? minGasPriceInGwei : undefined;
};

const getChainMinGasPriceInGwei = (
  chain: EvmChain,
  type: EvmTransactionType,
): Decimal | undefined => {
  if (
    !chain.isCustom ||
    !isLegacyTransactionType(type) ||
    !chain.customMinGasPriceInGwei
  ) {
    return undefined;
  }

  const minGasPriceInGwei = new Decimal(chain.customMinGasPriceInGwei);
  return minGasPriceInGwei.gt(0) ? minGasPriceInGwei : undefined;
};

const applyChainMinGasPrice = (
  estimates: RpcGasOracleEstimates,
  chain: EvmChain,
  type: EvmTransactionType,
): RpcGasOracleEstimates => {
  const chainMinGasPriceInGwei = getChainMinGasPriceInGwei(chain, type);
  if (!chainMinGasPriceInGwei) {
    return estimates;
  }

  const estimateMinGasPriceInGwei = getMinGasPriceInGwei(estimates, type);
  const minGasPrice = estimateMinGasPriceInGwei
    ? Decimal.max(estimateMinGasPriceInGwei, chainMinGasPriceInGwei).toString()
    : chainMinGasPriceInGwei.toString();

  return {
    ...estimates,
    minGasPrice,
  };
};

const getCappedLegacyGasPriceInGwei = (
  gasPriceInGwei: Decimal,
  minGasPriceInGwei?: Decimal,
): Decimal => {
  if (!minGasPriceInGwei) {
    return gasPriceInGwei;
  }
  return Decimal.max(gasPriceInGwei, minGasPriceInGwei);
};

const getLegacyTierGasPriceInGwei = (
  tier: RpcGasOracleEstimates['low'],
  minGasPriceInGwei?: Decimal,
): Decimal => {
  return getCappedLegacyGasPriceInGwei(
    new Decimal(tier.suggestedMaxFeePerGas),
    minGasPriceInGwei,
  );
};

const getCappedLegacyGasPriceInWei = (
  gasPriceWei: string,
  minGasPriceInGwei?: Decimal,
): string => {
  if (!minGasPriceInGwei) {
    return gasPriceWei;
  }

  const gasPriceInGwei = new Decimal(gasPriceWei).div(EvmFormatUtils.GWEI);
  return getCappedLegacyGasPriceInGwei(
    gasPriceInGwei,
    minGasPriceInGwei,
  )
    .mul(EvmFormatUtils.GWEI)
    .toFixed(0);
};

const buildFullEstimationFromEstimates = (
  estimates: RpcGasOracleEstimates,
  type: EvmTransactionType,
  gasLimit: number,
  price: Decimal,
): FullGasFeeEstimation => {
  const baseFeeInGwei = getBaseFeeInGwei(estimates);
  const minGasPriceInGwei = getMinGasPriceInGwei(estimates, type);
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
  const lowGasPriceInGwei = getLegacyTierGasPriceInGwei(
    estimates.low,
    minGasPriceInGwei,
  );
  const mediumGasPriceInGwei = getLegacyTierGasPriceInGwei(
    estimates.medium,
    minGasPriceInGwei,
  );
  const aggressiveGasPriceInGwei = getLegacyTierGasPriceInGwei(
    estimates.high,
    minGasPriceInGwei,
  );

  const maxLow = feeFromGweiAndGasLimit(lowGasPriceInGwei.toString(), gasLimit);
  const maxMedium = feeFromGweiAndGasLimit(
    mediumGasPriceInGwei.toString(),
    gasLimit,
  );
  const maxAggressive = feeFromGweiAndGasLimit(
    aggressiveGasPriceInGwei.toString(),
    gasLimit,
  );
  const low = feeFromGweiAndGasLimit(
    getTierEstimatedGasPriceInGwei(
      estimates.low,
      lowPriorityFee,
      baseFeeInGwei,
      type,
      minGasPriceInGwei,
    ).toString(),
    gasLimit,
  );
  const medium = feeFromGweiAndGasLimit(
    getTierEstimatedGasPriceInGwei(
      estimates.medium,
      mediumPriorityFee,
      baseFeeInGwei,
      type,
      minGasPriceInGwei,
    ).toString(),
    gasLimit,
  );
  const aggressive = feeFromGweiAndGasLimit(
    getTierEstimatedGasPriceInGwei(
      estimates.high,
      aggressivePriorityFee,
      baseFeeInGwei,
      type,
      minGasPriceInGwei,
    ).toString(),
    gasLimit,
  );
  const baseFeePerGasInGwei = baseFeeInGwei ?? new Decimal(0);

  return {
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
      maxFeePerGasInGwei: new Decimal(lowGasPriceInGwei),
      baseFeePerGasInGwei,
      gasPriceInGwei: new Decimal(lowGasPriceInGwei),
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
      maxFeePerGasInGwei: new Decimal(lowGasPriceInGwei),
      baseFeePerGasInGwei,
      gasPriceInGwei: new Decimal(lowGasPriceInGwei),
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
      maxFeePerGasInGwei: new Decimal(mediumGasPriceInGwei),
      baseFeePerGasInGwei,
      gasPriceInGwei: new Decimal(mediumGasPriceInGwei),
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
      maxFeePerGasInGwei: new Decimal(aggressiveGasPriceInGwei),
      baseFeePerGasInGwei,
      gasPriceInGwei: new Decimal(aggressiveGasPriceInGwei),
      gasLimit: new Decimal(gasLimit),
      icon: SVGIcons.EVM_GAS_FEE_HIGH,
      name: 'popup_html_evm_custom_gas_fee_aggressive',
    },
    custom: {
      type: type,
      estimatedFeeInEth: new Decimal(0),
      maxFeeInEth: new Decimal(0),
      estimatedFeeUSD: new Decimal(0),
      maxFeeUSD: new Decimal(0),
      estimatedMaxDuration: new Decimal(0),
      priorityFeeInGwei: new Decimal(0),
      maxFeePerGasInGwei: new Decimal(0),
      gasPriceInGwei: new Decimal(0),
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
        estimated: baseFeePerGasInGwei.toFixed(2),
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
    minGasPriceInGwei,
  };
};

const buildRpcFallbackCustomFee = async (
  chain: EvmChain,
  type: EvmTransactionType,
  gasLimit: number,
  price: Decimal,
): Promise<FullGasFeeEstimation> => {
  const provider = await EthersUtils.getProvider(chain);
  const feeDataResult = await provider.getFeeData();
  const feeData = feeDataResult.toJSON();

  let maxPriorityFeePerGasWei = feeData.maxPriorityFeePerGas
    ? BigInt(feeData.maxPriorityFeePerGas)
    : BigInt(0);

  if (maxPriorityFeePerGasWei <= BigInt(0)) {
    try {
      const rpcResult = await provider.send('eth_maxPriorityFeePerGas', []);
      if (rpcResult != null && rpcResult !== '0x0') {
        maxPriorityFeePerGasWei = BigInt(rpcResult);
      }
    } catch {
      // Use gas price fraction below.
    }
  }

  const minGasPriceInGwei = getChainMinGasPriceInGwei(chain, type);
  const rawGasPriceWei = feeData.gasPrice
    ? BigInt(feeData.gasPrice)
    : BigInt(0);
  const gasPriceWei =
    rawGasPriceWei > BigInt(0) && minGasPriceInGwei
      ? BigInt(
          getCappedLegacyGasPriceInWei(
            rawGasPriceWei.toString(),
            minGasPriceInGwei,
          ),
        )
      : rawGasPriceWei;
  if (maxPriorityFeePerGasWei <= BigInt(0) && gasPriceWei > BigInt(0)) {
    maxPriorityFeePerGasWei = gasPriceWei / BigInt(10);
  }

  let maxFeePerGasWei = feeData.maxFeePerGas
    ? BigInt(feeData.maxFeePerGas)
    : BigInt(0);
  if (maxFeePerGasWei <= BigInt(0) && gasPriceWei > BigInt(0)) {
    maxFeePerGasWei = gasPriceWei;
  }
  if (maxFeePerGasWei <= BigInt(0) && maxPriorityFeePerGasWei > BigInt(0)) {
    maxFeePerGasWei = maxPriorityFeePerGasWei;
  }

  const maxPriorityFeePerGasInGwei = EvmFormatUtils.weiToGwei(
    new Decimal(Number(maxPriorityFeePerGasWei)),
  );
  const gasPriceInGwei = EvmFormatUtils.weiToGwei(
    new Decimal(Number(gasPriceWei)),
  );
  const maxFeePerGasInGwei = EvmFormatUtils.weiToGwei(
    new Decimal(Number(maxFeePerGasWei)),
  );

  const block = await provider.getBlock('latest');
  const baseFeeInGwei = block?.baseFeePerGas
    ? EvmFormatUtils.weiToGwei(new Decimal(Number(block.baseFeePerGas)))
    : maxFeePerGasInGwei.sub(maxPriorityFeePerGasInGwei);

  const estimatedGweiPerGas = Decimal.max(
    baseFeeInGwei.add(maxPriorityFeePerGasInGwei),
    gasPriceInGwei,
  );

  const estimatedFee = feeFromGweiAndGasLimit(
    estimatedGweiPerGas.toString(),
    gasLimit,
  );
  const maxFee = feeFromGweiAndGasLimit(
    maxFeePerGasInGwei.toString(),
    gasLimit,
  );

  return {
    custom: {
      type: type,
      estimatedFeeInEth: estimatedFee,
      maxFeeInEth: maxFee,
      estimatedFeeUSD: estimatedFee.mul(price),
      maxFeeUSD: maxFee.mul(price),
      estimatedMaxDuration: new Decimal(0),
      priorityFeeInGwei: new Decimal(maxPriorityFeePerGasInGwei),
      maxFeePerGasInGwei: new Decimal(maxFeePerGasInGwei),
      baseFeePerGasInGwei: new Decimal(baseFeeInGwei),
      gasPriceInGwei: new Decimal(gasPriceInGwei),
      gasLimit: new Decimal(gasLimit),
      icon: SVGIcons.EVM_GAS_FEE_CUSTOM,
      name: 'popup_html_evm_custom_gas_fee_custom',
    },
    minGasPriceInGwei,
  };
};

const attachDAppSuggestion = async (
  feeResult: FullGasFeeEstimation,
  transactionData: ProviderTransactionData | undefined,
  gasLimit: number,
  price: Decimal,
) => {
  if (
    !transactionData ||
    (!transactionData.gasPrice &&
      !transactionData.maxFeePerGas &&
      !transactionData.maxPriorityFeePerGas)
  ) {
    return feeResult;
  }

  feeResult.suggestedByDApp = await createDAppSuggestionFromTransactionData(
    transactionData,
    gasLimit,
    feeResult,
    price,
  );
  return feeResult;
};

const estimate = async (
  chain: EvmChain,
  fromAddress: string,
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
        fromAddress,
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
    const rpcEstimates = await RpcGasFeeEstimator.fetchTiers(provider, type);

    if (rpcEstimates) {
      const estimatesWithChainMinimum = applyChainMinGasPrice(
        rpcEstimates,
        chain,
        type,
      );
      const fullEstimation = buildFullEstimationFromEstimates(
        estimatesWithChainMinimum,
        type,
        gasLimit,
        price,
      );
      return attachDAppSuggestion(
        fullEstimation,
        transactionData,
        gasLimit,
        price,
      );
    }

    const feeResult = await buildRpcFallbackCustomFee(
      chain,
      type,
      gasLimit,
      price,
    );
    return attachDAppSuggestion(feeResult, transactionData, gasLimit, price);
  }

  const fullEstimation = buildFullEstimationFromEstimates(
    estimates as RpcGasOracleEstimates,
    type,
    gasLimit,
    price,
  );
  return attachDAppSuggestion(fullEstimation, transactionData, gasLimit, price);
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
      transactionData.gasPrice = getCappedLegacyGasPriceInWei(
        transactionData.gasPrice,
        estimates.minGasPriceInGwei,
      );
      maxFee = new Decimal(Number(transactionData.gasPrice!)).div(
        EvmFormatUtils.GWEI,
      );
      estimatedFee = maxFee;
      break;
    }
    case EvmTransactionType.EIP_4844: {
      maxFee = new Decimal(1); // TODO fix
      break;
    }
  }

  maxFee = maxFee!.mul(Decimal.div(gasLimitToUse, 1000000)).div(1000);

  estimatedFee = new Decimal(Number(estimatedFee ?? 0))
    .mul(Decimal.div(gasLimitToUse, 1000000))
    .div(1000);
  let estimatedMaxDuration = new Decimal(0);
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
  isGasFeeEstimateInvalid,
  hasDisplayableEstimatedFee,
  hasDisplayableMaxFee,
  hasDisplayableDuration,
  formatGasFeeValue,
};
