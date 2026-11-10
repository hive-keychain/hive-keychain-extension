import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmFeeTrend } from '@popup/evm/interfaces/gas-fee.interface';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import Decimal from 'decimal.js';
import { ethers } from 'ethers';
import Logger from 'src/utils/logger.utils';

/** Minimum suggested priority fee in gwei for custom-chain RPC tiers. */
const MIN_SUGGESTED_PRIORITY_FEE_GWEI = 0.001;

const EIP1559_TIER_SETTINGS = {
  low: {
    baseFeeMultiplier: 1.1,
    priorityFeeMultiplier: 0.94,
    maxWaitTimeEstimate: 60_000,
  },
  medium: {
    baseFeeMultiplier: 1.2,
    priorityFeeMultiplier: 0.97,
    maxWaitTimeEstimate: 30_000,
  },
  high: {
    baseFeeMultiplier: 1.25,
    priorityFeeMultiplier: 0.98,
    maxWaitTimeEstimate: 15_000,
  },
} as const;

const LEGACY_TIER_MULTIPLIERS = {
  low: 0.9,
  medium: 1.0,
  high: 1.1,
} as const;

export interface RpcGasOracleEstimates {
  low: RpcGasTierEstimate;
  medium: RpcGasTierEstimate;
  high: RpcGasTierEstimate;
  minGasPrice?: string | null;
  estimatedBaseFee: string | null;
  latestPriorityFeeRange: [string, string];
  historicalPriorityFeeRange: [string, string];
  historicalBaseFeeRange: [string, string];
  baseFeeTrend: EvmFeeTrend;
  priorityFeeTrend: EvmFeeTrend;
}

interface RpcGasTierEstimate {
  suggestedMaxPriorityFeePerGas: string;
  suggestedMaxFeePerGas: string;
  maxWaitTimeEstimate: number;
}

const toGweiString = (wei: bigint): string => {
  return EvmFormatUtils.weiToGwei(new Decimal(Number(wei))).toString();
};

const applyMinPriorityFeeGwei = (priorityGwei: Decimal): Decimal => {
  return Decimal.max(priorityGwei, MIN_SUGGESTED_PRIORITY_FEE_GWEI);
};

const buildEip1559Tier = (
  tier: keyof typeof EIP1559_TIER_SETTINGS,
  baseFeeGwei: Decimal,
  priorityFeeGwei: Decimal,
): RpcGasTierEstimate => {
  const settings = EIP1559_TIER_SETTINGS[tier];
  const adjustedBase = baseFeeGwei.mul(settings.baseFeeMultiplier);
  const adjustedPriority = applyMinPriorityFeeGwei(
    priorityFeeGwei.mul(settings.priorityFeeMultiplier),
  );
  const suggestedMaxFeePerGas = adjustedBase.add(adjustedPriority);

  return {
    suggestedMaxPriorityFeePerGas: adjustedPriority.toString(),
    suggestedMaxFeePerGas: suggestedMaxFeePerGas.toString(),
    maxWaitTimeEstimate: settings.maxWaitTimeEstimate,
  };
};

const buildLegacyTier = (
  tier: keyof typeof LEGACY_TIER_MULTIPLIERS,
  gasPriceGwei: Decimal,
): RpcGasTierEstimate => {
  const adjustedGasPrice = gasPriceGwei.mul(LEGACY_TIER_MULTIPLIERS[tier]);
  const gasPriceString = adjustedGasPrice.toString();

  return {
    suggestedMaxPriorityFeePerGas: '0',
    suggestedMaxFeePerGas: gasPriceString,
    maxWaitTimeEstimate: EIP1559_TIER_SETTINGS[tier].maxWaitTimeEstimate,
  };
};

const getMaxPriorityFeePerGasWei = async (
  provider: ethers.JsonRpcApiProvider,
  gasPriceWei?: bigint,
): Promise<bigint> => {
  try {
    const result = await provider.send('eth_maxPriorityFeePerGas', []);
    if (result != null && result !== '0x0') {
      return BigInt(result);
    }
  } catch {
    // Fall through to gas price fraction.
  }

  if (gasPriceWei != null && gasPriceWei > BigInt(0)) {
    return gasPriceWei / BigInt(10);
  }

  return BigInt(0);
};

const fetchEip1559Tiers = async (
  provider: ethers.JsonRpcApiProvider,
): Promise<RpcGasOracleEstimates | null> => {
  const block = await provider.getBlock('latest');
  if (!block?.baseFeePerGas) {
    return null;
  }

  const baseFeeGwei = new Decimal(toGweiString(block.baseFeePerGas));
  const feeData = await provider.getFeeData();
  const gasPriceWei = feeData.gasPrice ?? undefined;
  const priorityFeeWei = await getMaxPriorityFeePerGasWei(
    provider,
    gasPriceWei,
  );
  const priorityFeeGwei = applyMinPriorityFeeGwei(
    new Decimal(toGweiString(priorityFeeWei)),
  );

  const low = buildEip1559Tier('low', baseFeeGwei, priorityFeeGwei);
  const medium = buildEip1559Tier('medium', baseFeeGwei, priorityFeeGwei);
  const high = buildEip1559Tier('high', baseFeeGwei, priorityFeeGwei);

  const priorityMin = priorityFeeGwei.mul(0.8).toString();
  const priorityMax = priorityFeeGwei.mul(1.2).toString();
  const baseMin = baseFeeGwei.mul(0.9).toString();
  const baseMax = baseFeeGwei.mul(1.1).toString();

  return {
    low,
    medium,
    high,
    estimatedBaseFee: baseFeeGwei.toString(),
    latestPriorityFeeRange: [priorityMin, priorityMax],
    historicalPriorityFeeRange: [priorityMin, priorityMax],
    historicalBaseFeeRange: [baseMin, baseMax],
    baseFeeTrend: EvmFeeTrend.UP,
    priorityFeeTrend: EvmFeeTrend.DOWN,
  };
};

const fetchLegacyTiers = async (
  provider: ethers.JsonRpcApiProvider,
): Promise<RpcGasOracleEstimates | null> => {
  const feeData = await provider.getFeeData();
  const gasPriceWei = feeData.gasPrice;
  if (!gasPriceWei || gasPriceWei <= BigInt(0)) {
    return null;
  }

  const gasPriceGwei = new Decimal(toGweiString(gasPriceWei));
  const low = buildLegacyTier('low', gasPriceGwei);
  const medium = buildLegacyTier('medium', gasPriceGwei);
  const high = buildLegacyTier('high', gasPriceGwei);

  const gasPriceString = gasPriceGwei.toString();
  const gasPriceMin = gasPriceGwei.mul(0.9).toString();
  const gasPriceMax = gasPriceGwei.mul(1.1).toString();

  return {
    low,
    medium,
    high,
    estimatedBaseFee: gasPriceString,
    latestPriorityFeeRange: ['0', '0'],
    historicalPriorityFeeRange: ['0', '0'],
    historicalBaseFeeRange: [gasPriceMin, gasPriceMax],
    baseFeeTrend: EvmFeeTrend.UP,
    priorityFeeTrend: EvmFeeTrend.DOWN,
  };
};

const fetchTiers = async (
  provider: ethers.JsonRpcApiProvider,
  txType: EvmTransactionType,
): Promise<RpcGasOracleEstimates | null> => {
  try {
    if (txType === EvmTransactionType.EIP_1559) {
      const eip1559Tiers = await fetchEip1559Tiers(provider);
      if (eip1559Tiers) {
        return eip1559Tiers;
      }
    }

    return await fetchLegacyTiers(provider);
  } catch (error) {
    Logger.error('RpcGasFeeEstimator.fetchTiers failed', error);
    return null;
  }
};

export const RpcGasFeeEstimator = {
  fetchTiers,
  MIN_SUGGESTED_PRIORITY_FEE_GWEI,
  EIP1559_TIER_SETTINGS,
  LEGACY_TIER_MULTIPLIERS,
};
