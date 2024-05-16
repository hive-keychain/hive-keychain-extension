export interface GasFeeEstimation {
  estimatedFee: number;
  estimatedMaxDuration: number;
}

export interface FullGasFeeEstimation {
  suggested: GasFeeEstimation;
  low: GasFeeEstimation;
  medium: GasFeeEstimation;
  aggressive: GasFeeEstimation;
  max: GasFeeEstimation;
}
