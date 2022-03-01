import MkModule from '@background/mk.module';
import { RequestsHandler } from '@background/requests';
import { createMessage } from '@background/requests/operations/operations.utils';
import { RequestAddAccount, RequestId } from '@interfaces/keychain.interface';
import { Keys } from '@interfaces/keys.interface';
import AccountUtils from 'src/utils/account.utils';
import KeysUtils from 'src/utils/keys.utils';

export const addAccount = async (
  requestHandler: RequestsHandler,
  data: RequestAddAccount & RequestId,
) => {
  const { username, keys } = data;
  let err = null;
  const client = requestHandler.getHiveClient();
  const account = (await client.database.getAccounts([username]))[0];
  if (account) {
    const savedKeys: Keys = keys;
    if (keys.memo) savedKeys.memoPubkey = account.memo_key;
    if (keys.active) {
      for (const active of account.active.key_auths) {
        if (
          KeysUtils.getPublicKeyFromPrivateKeyString(keys.active) ===
          (active[0] as string)
        )
          savedKeys.activePubkey = active[0] as string;
      }
      if (!savedKeys.activePubkey) throw new Error();
    }
    if (keys.posting) {
      for (const posting of account.posting.key_auths) {
        if (
          KeysUtils.getPublicKeyFromPrivateKeyString(keys.posting) ===
          (posting[0] as string)
        )
          savedKeys.postingPubkey = posting[0] as string;
      }
      if (!savedKeys.postingPubkey) throw new Error();
    }
    const mk = await MkModule.getMk();
    if (Object.keys(savedKeys).length && mk) {
      // addAccount
      const accounts = await AccountUtils.getAccountsFromLocalStorage(mk);
      await AccountUtils.saveAccounts(
        [...accounts, { name: username, keys }],
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
  return createMessage(
    !!err,
    !err,
    data,
    err
      ? null
      : await chrome.i18n.getMessage('bgd_ops_add_account', [username]),
    err,
  );
};
