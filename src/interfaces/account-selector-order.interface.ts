export type AccountSelectorOrderRef =
  | { type: 'hive'; name: string }
  | { type: 'evm'; seedId: number; accountId: number };

export interface AccountSelectorDisplayOrderPayload {
  list: AccountSelectorOrderRef[];
}
