export enum BackgroundCommand {
  // MK
  GET_MK = 'getMk',
  SEND_BACK_MK = 'sendBackMk',
  SAVE_MK = 'saveMk',

  // Import
  IMPORT_ACCOUNTS = 'importAccounts',
  SEND_BACK_IMPORTED_ACCOUNTS = 'sendBackimportedAccounts',

  // Keychain Request
  SEND_REQUEST = 'sendRequest',
  UNLOCK_FROM_DIALOG = 'unlockFromDialog',
  ACCEPT_TRANSACTION = 'acceptTransaction',
}
