export enum BackgroundCommand {
  // MK
  GET_MK = 'getMk',
  SEND_BACK_MK = 'sendBackMk',
  SAVE_MK = 'saveMk',

  // Import
  IMPORT_ACCOUNTS = 'importAccounts',
  SEND_BACK_IMPORTED_ACCOUNTS = 'sendBackimportedAccounts',
  SEND_BACK_SETTINGS = 'sendBackSettings',
  IMPORT_SETTINGS_CALLBACK = 'importSettingsCallback',

  //RPC
  SAVE_RPC = 'saveRPC',
  SET_ACTIVE_RPC = 'setActiveRpc',

  // Keychain Request
  SEND_REQUEST = 'sendRequest',
  UNLOCK_FROM_DIALOG = 'unlockFromDialog',
  REGISTER_FROM_DIALOG = 'registerFromDialog',
  ACCEPT_TRANSACTION = 'acceptTransaction',

  // User preferences
  UPDATE_CLAIMS = 'updateClaims',
  UPDATE_AUTOLOCK = 'updateAutoLock',
  LOCK_APP = 'lockApp',
}
