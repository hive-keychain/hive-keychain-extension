export interface EvmSettings {
  smartContracts: EvmSmartContractsSettings;
  providerCompatibility: EvmProviderCompatibilitySettings;
}

export interface EvmSmartContractsSettings {
  displayPossibleSpam: boolean;
  displayNonVerifiedContracts: boolean;
}

export interface EvmProviderCompatibilitySettings {
  /**
   * `true` and `false` are explicit choices.
   * `null` means the last EVM account was removed.
   * A missing value means this field has never been stored.
   */
  preferOnLegacyDapps: boolean | null;
}
