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
  extraInfo: GasFeeEstimationExtraInfo;
}

export interface GasFeeEstimationExtraInfo {
  priorityFee: {
    latest: {
      min: string;
      max: string;
    };
    history: {
      min: string;
      max: string;
    };
  };
  baseFee: {
    estimated: string;
    baseFeeRange: {
      min: string;
      max: string;
    };
  };
  trends: {
    baseFee: EvmFeeTrend;
    priorityFee: EvmFeeTrend;
  };
}

export enum EvmFeeTrend {
  UP = 'up',
  DOWN = 'down',
}

export interface CustomGasFeeForm {
  maxBaseFeeInGwei: number;
  maxBaseFeeValue?: number;
  priorityFeeInGwei: number;
  priorityFeeValue?: number;
  gasLimit: number;
}
