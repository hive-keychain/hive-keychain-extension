import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import Decimal from 'decimal.js';
import { SVGIcons } from 'src/common-ui/icons.enum';

export interface GasFeeEstimationBase {
  type: EvmTransactionType;
  estimatedFee: Decimal;
  estimatedFeeUSD: Decimal;
  maxFee: Decimal;
  maxFeeUSD: Decimal;
  estimatedMaxDuration: Decimal;
  gasLimit: Decimal;
  deactivated?: boolean;
  priorityFee?: Decimal;
  maxFeePerGas?: Decimal;
  gasPrice?: Decimal;
  icon: SVGIcons;
  name: string;
}

export interface FullGasFeeEstimation {
  low?: GasFeeEstimationBase;
  medium?: GasFeeEstimationBase;
  aggressive?: GasFeeEstimationBase;
  suggested?: GasFeeEstimationBase;
  custom?: GasFeeEstimationBase;
  suggestedByDApp?: GasFeeEstimationBase;
  increased?: GasFeeEstimationBase;
  extraInfo?: GasFeeEstimationExtraInfo;
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
  maxBaseFeeInGwei: string;
  maxBaseFeeInEth?: Decimal;
  priorityFeeInGwei: string;
  priorityFeeInEth?: Decimal;
  gasPriceInGwei: string;
  gasPriceInEth?: Decimal;
  gasLimit: string;
  type?: EvmTransactionType;
}
