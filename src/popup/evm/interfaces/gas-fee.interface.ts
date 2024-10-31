import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { SVGIcons } from 'src/common-ui/icons.enum';

export interface GasFeeEstimationBase {
  type: EvmTransactionType;
  estimatedFee: number;
  maxFee: number;
  estimatedMaxDuration: number;
  gasLimit: number;
  deactivated?: boolean;
  priorityFee?: number;
  maxFeePerGas?: number;
  gasPrice?: number;
  icon: SVGIcons;
  name: string;
}

export interface FullGasFeeEstimation {
  low: GasFeeEstimationBase;
  medium: GasFeeEstimationBase;
  aggressive: GasFeeEstimationBase;
  suggested: GasFeeEstimationBase;
  custom: GasFeeEstimationBase;
  suggestedByDApp?: GasFeeEstimationBase;
  increased?: GasFeeEstimationBase;
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
  gasPriceInGwei: number;
  gasPriceValue?: number;
  gasLimit: number;
  type?: EvmTransactionType;
}

interface test {
  maxPriorityFeePerGas: bigint;
  maxFeePerGas: bigint;
  type: EvmTransactionType;
  estimatedFee: number;
  estimatedMaxDuration: number;
  gasLimit: number;
  deactivated?: boolean;
  priorityFee?: number;
  gasPrice?: number;
}

interface test2 {
  maxPriorityFeePerGas: bigint;
  maxFeePerGas: bigint;
  type: EvmTransactionType;
  estimatedFee: number;
  estimatedMaxDuration: number;
  gasLimit: number;
  deactivated?: boolean | undefined;
  priorityFee?: number | undefined;
  gasPrice?: number | undefined;
}

export interface GasFeeData {
  priorityFee?: bigint;
  maxFeePerGas?: bigint;
  gasPrice?: bigint;
}
