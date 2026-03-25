export interface EvmSettings {
  smartContracts: EvmSmartContractsSettings;
  providerCompatibility: EvmProviderCompatibilitySettings;
}

export interface EvmSmartContractsSettings {
  displayPossibleSpam: boolean;
  displayNonVerifiedContracts: boolean;
}

export interface EvmProviderCompatibilitySettings {
  preferOnLegacyDapps: boolean;
}
