export enum GuidedTourId {
  ADD_EVM_ACCOUNT = 'add_evm_account',
  ADD_EVM_CHAINS = 'add_evm_chains',
}

export enum GuidedTourTarget {
  ACCOUNT_SELECTOR_TRIGGER = 'account-selector-trigger',
  ACCOUNT_SELECTOR_MANAGE_BUTTON = 'account-selector-manage-button',
  ACCOUNT_SELECTOR_CREATE_BUTTON = 'account-selector-create-button',
  ADD_ACCOUNT_TYPE_EVM = 'add-account-type-evm',
  CHAIN_DROPDOWN_TRIGGER = 'chain-dropdown-trigger',
  CHAIN_DROPDOWN_PANEL = 'chain-dropdown-panel',
  CHAIN_SELECTOR = 'chain-selector',
}

export enum GuidedTourStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DISMISSED = 'dismissed',
}

export const GUIDED_TOUR_TARGET_ATTRIBUTE = 'data-guided-tour';
