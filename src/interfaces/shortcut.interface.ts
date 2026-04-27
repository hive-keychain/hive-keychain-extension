export enum ShortcutActionType {
  NAVIGATE = 'NAVIGATE',
  CHANGE_ACCOUNT = 'CHANGE_ACCOUNT',
  CHANGE_CHAIN = 'CHANGE_CHAIN',
}

export enum ShortcutAccountType {
  HIVE = 'HIVE',
  EVM = 'EVM',
}

export interface ShortcutParams {
  selectedCurrency?: 'hive' | 'hbd';
  tokenSymbol?: string;
  delegationType?: string;
  powerType?: string;
  chainId?: string;
  accountType?: ShortcutAccountType;
  accountId?: string;
  evmTokenContractAddress?: string;
  evmTokenType?: string;
}

export interface ShortcutDefinition {
  id: string;
  combo: string;
  actionType: ShortcutActionType;
  target: string;
  params?: ShortcutParams;
}
