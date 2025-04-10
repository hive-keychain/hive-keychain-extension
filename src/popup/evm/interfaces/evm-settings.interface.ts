export interface EvmSettings {
  smartContracts: EvmSmartContractsSettings;
}

export interface EvmSmartContractsSettings {
  displayPossibleSpam: boolean;
  displayNonVerifiedContracts: boolean;
}
