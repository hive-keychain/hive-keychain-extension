import MkModule from '@background/mk.module';
import { createMessage } from '@background/requests/operations/operations.utils';
import { RequestsHandler } from '@background/requests/request-handler';
import { RequestAddAccount, RequestId } from '@interfaces/keychain.interface';
import { Keys } from '@interfaces/keys.interface';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import { KeysUtils } from 'src/popup/hive/utils/keys.utils';

export const addAccount = async (
  requestHandler: RequestsHandler,
  data: RequestAddAccount & RequestId,
) => {
  const { username, keys } = data;
  let err = null;
  const mk = await MkModule.getMk();
  const accounts = (await AccountUtils.getAccountsFromLocalStorage(mk)) || [];
  const account = await AccountUtils.getExtendedAccount(username);
  if (account) {
    const savedKeys: Keys = { ...keys };
    if (keys.memo) savedKeys.memoPubkey = account.memo_key;
    if (keys.active) {
      if (!keys.active.startsWith('@')) {
        for (const active of account.active.key_auths) {
          if (
            KeysUtils.getPublicKeyFromPrivateKeyString(keys.active) ===
            (active[0] as string)
          )
            savedKeys.activePubkey = active[0] as string;
        }
      } else {
        const authAccountKeys = await AccountUtils.addAuthorizedAccount(
          username,
          keys.active.replace('@', ''),
          accounts,
        );

        if (authAccountKeys?.active) {
          savedKeys.activePubkey = keys.active;
          savedKeys.active = authAccountKeys.active;
        }
      }
      if (!savedKeys.activePubkey) throw new Error('Invalid active key');
    }
    if (keys.posting) {
      if (!keys.posting.startsWith('@')) {
        for (const posting of account.posting.key_auths) {
          if (
            KeysUtils.getPublicKeyFromPrivateKeyString(keys.posting) ===
            (posting[0] as string)
          )
            savedKeys.postingPubkey = posting[0] as string;
        }
      } else {
        const authAccountKeys = await AccountUtils.addAuthorizedAccount(
          username,
          keys.posting.replace('@', ''),
          accounts,
        );
        if (authAccountKeys?.posting) {
          savedKeys.posting = authAccountKeys.posting;
          savedKeys.postingPubkey = keys.posting;
        }
      }
      if (!savedKeys.postingPubkey) throw new Error('Invalid posting key');
    }
    if (Object.keys(savedKeys).length && mk) {
      // addAccount
      await AccountUtils.saveAccounts(
        [...accounts, { name: username, keys: savedKeys }],
        mk,
      );
    } else {
      // Error no corresponding keys
      err = await chrome.i18n.getMessage('bgd_ops_add_account_error');
    }
  } else {
    // Error no such account
    err = await chrome.i18n.getMessage('bgd_ops_add_account_error_invalid');
  }
  return await createMessage(
    !!err,
    !err,
    data,
    err
      ? null
      : await chrome.i18n.getMessage('bgd_ops_add_account', [username]),
    err,
  );
};
