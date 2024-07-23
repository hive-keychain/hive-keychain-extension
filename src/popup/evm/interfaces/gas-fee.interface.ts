export interface GasFeeEstimation {
  estimatedFee: number;
  estimatedMaxDuration: number;
  priorityFee: number;
  maxFeePerGas: number;
  gasLimit: number;
}

export interface FullGasFeeEstimation {
  [FeeEstimationType.LOW]: GasFeeEstimation;
  [FeeEstimationType.MEDIUM]: GasFeeEstimation;
  [FeeEstimationType.AGGRESSIVE]: GasFeeEstimation;
  [FeeEstimationType.MAX]: GasFeeEstimation;
  [FeeEstimationType.SUGGESTED]: GasFeeEstimation;
  [FeeEstimationType.CUSTOM]: GasFeeEstimation;
  [FeeEstimationType.INCREASED]?: GasFeeEstimation;
}

export enum FeeEstimationType {
  LOW = 'low',
  MEDIUM = 'medium',
  AGGRESSIVE = 'aggressive',
  MAX = 'max',
  SUGGESTED = 'suggested',
  CUSTOM = 'custom',
  INCREASED = 'increased',
}

export interface CustomGasFeeForm {
  maxBaseFeeInGwei: number;
  maxBaseFeeValue?: number;
  priorityFeeInGwei: number;
  priorityFeeValue?: number;
  gasLimit: number;
}
