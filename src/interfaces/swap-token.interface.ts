export interface SwapStep {
  step: SwapStepType;
  estimate: number;
  startToken: string;
  endToken: string;
  provider: string;
}

export enum SwapStepType {
  DEPOSIT_TO_HIVE_ENGINE = 'DEPOSIT_TO_HIVE_ENGINE',
  WITHDRAWAL_FROM_HIVE_ENGINE = 'WITHDRAWAL_FROM_HIVE_ENGINE',
  CONVERT_INTERNAL_MARKET = 'CONVERT_INTERNAL_MARKET',
  SWAP_TOKEN = 'SWAP',
  BUY_ON_HIVE_ENGINE_MARKET = 'BUY_ON_HIVE_ENGINE_MARKET',
  SELL_ON_HIVE_ENGINE_MARKET = 'SELL_ON_HIVE_ENGINE_MARKET',
  BUY_ON_MARKET = 'BUY_ON_MARKET',
  SELL_ON_MARKET = 'SELL_ON_MARKET',
}

export enum SwapStatus {
  PENDING = 'PENDING',
  STARTED = 'STARTED',
  CANCELED = 'CANCELED',
  FINISHED = 'FINISHED',
}

export interface Swap {
  id: string;
  username: string;
  startToken: string;
  endToken: string;
  amount: string;
  estimatedFinalAmount: string;
  slipperage: number;
  status: SwapStatus;
  steps: Step[];
  history: HistoryStep[];
}

export interface Step {
  id: number;
  type: SwapStepType;
  stepNumber: number;
  estimate: number;
  startToken: string;
  endToken: string;
  provider: Provider;
}

export interface HistoryStep {
  stepNumber: number;
  startToken: string;
  amountStartToken: number;
  amountEndToken: number;
  endToken: string;
  type: string;
  provider: string;
  status: string;
  transactionId: string;
}

export enum Provider {
  HIVE_INTERNAL_MARKET = 'HIVE_INTERNAL_MARKET',
  BEESWAP = 'BEESWAP',
  HIVE_PAY = 'HIVE_PAY',
  DISCOUNTED_BRIDGE = 'DISCOUNTED_BRIDGE',
  LEODEX = 'LEODEX',
  HIVE_ENGINE = 'HIVE_ENGINE',
  LIQUIDITY_POOL = 'LIQUIDITY_POOL',
  HIVE_ENGINE_INTERNAL_MARKET = 'HIVE_ENGINE_INTERNAL_MARKET',
}
