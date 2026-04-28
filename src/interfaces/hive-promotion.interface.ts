export interface EvmOnlyHivePromotionStorage {
  dismissedPermanently?: boolean;
  snoozedUntil?: string;
  lastShownAt?: string;
}

export interface EvmOnlyHivePromotionEligibilityInput
  extends EvmOnlyHivePromotionStorage {
  installDate?: string | number | Date | null;
  evmAccountsCount: number;
  hiveAccountsCount: number;
  pendingHiveAccountCreationCount: number;
  walletUnlocked: boolean;
  sensitiveFlowActive?: boolean;
  now?: Date;
}

export interface GetEvmOnlyHivePromotionEligibilityOptions {
  mk?: string | null;
  walletUnlocked: boolean;
  sensitiveFlowActive?: boolean;
  now?: Date;
}
