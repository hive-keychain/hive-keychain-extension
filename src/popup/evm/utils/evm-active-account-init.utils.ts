/**
 * Coordinates chain-change init so account-selector picks are not overwritten
 * by restoring the last saved EVM wallet from local storage.
 */
let pendingUserEvmWalletChainId: string | null = null;

const markPendingUserEvmWalletSelection = (chainId: string) => {
  pendingUserEvmWalletChainId = chainId.toLowerCase();
};

const shouldSkipRestoreActiveEvmAccountOnChainChange = (chainId: string) => {
  if (pendingUserEvmWalletChainId !== chainId.toLowerCase()) {
    return false;
  }
  pendingUserEvmWalletChainId = null;
  return true;
};

export const EvmActiveAccountInitUtils = {
  markPendingUserEvmWalletSelection,
  shouldSkipRestoreActiveEvmAccountOnChainChange,
};
