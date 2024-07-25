export interface GasFeeEstimation {
  estimatedFee: number;
  estimatedMaxDuration: number;
  priorityFee: number;
  maxFeePerGas: number;
  gasLimit: number;
  deactivated?: boolean;
}

export interface FullGasFeeEstimation {
  low: GasFeeEstimation;
  medium: GasFeeEstimation;
  aggressive: GasFeeEstimation;
  max: GasFeeEstimation;
  suggested: GasFeeEstimation;
  custom: GasFeeEstimation;
  increased?: GasFeeEstimation;
}

export interface CustomGasFeeForm {
  maxBaseFeeInGwei: number;
  maxBaseFeeValue?: number;
  priorityFeeInGwei: number;
  priorityFeeValue?: number;
  gasLimit: number;
}
