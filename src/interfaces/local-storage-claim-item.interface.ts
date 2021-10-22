export interface LocalStorageClaimItem {
  [key: string]: boolean;
}

export interface LocalStorageClaim {
  claimRewards: LocalStorageClaimItem;
  claimAccounts: LocalStorageClaimItem;
}
