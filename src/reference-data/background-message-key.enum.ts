export enum BackgroundCommand {
  PING = 'PING',

  // MK
  GET_MK = 'getMk',
  SEND_BACK_MK = 'sendBackMk',
  SAVE_MK = 'saveMk',

  // Import
  IMPORT_ACCOUNTS = 'importAccounts',
  SEND_BACK_IMPORTED_ACCOUNTS = 'sendBackimportedAccounts',
  IMPORT_BACKUP = 'importBackup',
  SEND_BACK_IMPORTED_BACKUP = 'sendBackimportedBackup',
  IMPORT_BACKUP_CALLBACK = 'importBackupCallback',

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
