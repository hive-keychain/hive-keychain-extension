export enum BackgroundCommand {
  // MK
  GET_MK = 'getMk',
  SEND_BACK_MK = 'sendBackMk',
  SAVE_MK = 'saveMk',

  // Import
  IMPORT_ACCOUNTS = 'importAccounts',
  SEND_BACK_IMPORTED_ACCOUNTS = 'sendBackimportedAccounts',
  SEND_BACK_SETTINGS = 'sendBackSettings',

  //RPC
  SAVE_RPC = 'saveRPC',
  SET_ACTIVE_RPC = 'setActiveRpc',

  // Keychain Request
  SEND_REQUEST = 'sendRequest',
  UNLOCK_FROM_DIALOG = 'unlockFromDialog',
  ACCEPT_TRANSACTION = 'acceptTransaction',

  // User preferences
  UPDATE_CLAIMS = 'updateClaims',
  SAVE_ENABLE_KEYCHAINIFY = 'saveEnableKeychainify',
  UPDATE_AUTOLOCK = 'updateAutoLock',
  LOCK_APP = 'lockApp',
}
