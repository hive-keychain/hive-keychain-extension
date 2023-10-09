export interface SwapConfig {
  account: string;
  fee: SwapFeeConfig;
  slippage: SwapSlippageConfig;
}

export interface SwapServerStatus {
  isMaintenanceOn: boolean;
  isServerStopped: boolean;
  layerTwoDelayed: boolean;
}

interface SwapFeeConfig {
  account: string;
  amount: number;
}

interface SwapSlippageConfig {
  min: number;
  default: number;
}
