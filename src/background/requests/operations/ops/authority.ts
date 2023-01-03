import { RequestsHandler } from '@background/requests';
import {
  beautifyErrorMessage,
  createMessage,
} from '@background/requests/operations/operations.utils';
import {
  KeychainKeyTypesLC,
  RequestAddAccountAuthority,
  RequestAddKeyAuthority,
  RequestId,
  RequestRemoveAccountAuthority,
  RequestRemoveKeyAuthority,
} from '@interfaces/keychain.interface';
import { KeychainError } from 'src/keychain-error';
import AccountUtils from 'src/utils/account.utils';
import Logger from 'src/utils/logger.utils';

export const broadcastAddAccountAuthority = async (
  requestHandler: RequestsHandler,
  data: RequestAddAccountAuthority & RequestId,
) => {
  let err, result, err_message;
  const { username, authorizedUsername } = data;
  let role = data.role.toLowerCase();
  let { weight } = data;
  try {
    const key = requestHandler.data.key;
    const userAccount = await AccountUtils.getExtendedAccount(username);

    const updatedAuthority = userAccount[role as 'posting' | 'active'];

    /** Release callback if the account already exist in the account_auths array */
    const authorizedAccounts = updatedAuthority.account_auths.map(
      (auth) => auth[0],
    );

    const hasAuthority = authorizedAccounts.indexOf(authorizedUsername) !== -1;
    if (hasAuthority) {
      throw new KeychainError('already_has_authority_error');
    }

    /** Use weight_thresold as default weight */
    weight =
      weight || userAccount[role as 'posting' | 'active'].weight_threshold;
    updatedAuthority.account_auths.push([authorizedUsername, +weight]);
    updatedAuthority.account_auths.sort((a, b) => a[0].localeCompare(b[0]));

    const active =
      role === KeychainKeyTypesLC.active
        ? updatedAuthority
        : userAccount.active;
    const posting =
      role === KeychainKeyTypesLC.posting
        ? updatedAuthority
        : userAccount.posting;

    /** Add authority on user account */
    result = await AccountUtils.updateAccount(
      userAccount.name,
      active,
      posting,
      userAccount.memo_key,
      userAccount.json_metadata,
      key!,
    );
  } catch (e) {
    Logger.error(e);
    err = (e as KeychainError).trace || e;
    err_message = await chrome.i18n.getMessage(
      (e as KeychainError).message,
      (e as KeychainError).messageParams,
    );
  } finally {
    const err_message = await beautifyErrorMessage(err);
    return createMessage(
      err,
      result,
      data,
      await chrome.i18n.getMessage('bgd_ops_add_auth', [
        data.role.toLowerCase(),
        data.authorizedUsername,
        data.username,
      ]),
      err_message,
    );
  }
};

export const broadcastRemoveAccountAuthority = async (
  requestHandler: RequestsHandler,
  data: RequestRemoveAccountAuthority & RequestId,
) => {
  let err, result, err_message;
  const { username, authorizedUsername } = data;
  let role = data.role.toLowerCase();
  try {
    const key = requestHandler.data.key;
    const userAccount = await AccountUtils.getExtendedAccount(username);

    const updatedAuthority = userAccount[role as 'posting' | 'active'];
    const totalAuthorizedUser = updatedAuthority.account_auths.length;
    for (let i = 0; i < totalAuthorizedUser; i++) {
      const user = updatedAuthority.account_auths[i];
      if (user[0] === authorizedUsername) {
        updatedAuthority.account_auths.splice(i, 1);
        break;
      }
    }

    /** Release callback if the account does not exist in the account_auths array */
    if (totalAuthorizedUser === updatedAuthority.account_auths.length) {
      throw new Error('nothing_to_remove_error');
    }

    const active =
      role === KeychainKeyTypesLC.active ? updatedAuthority : undefined;
    const posting =
      role === KeychainKeyTypesLC.posting ? updatedAuthority : undefined;

    result = await AccountUtils.updateAccount(
      userAccount.name,
      active,
      posting,
      userAccount.memo_key,
      userAccount.json_metadata,
      key!,
    );
  } catch (e) {
    Logger.error(e);
    err = (e as KeychainError).trace || e;
    err_message = await chrome.i18n.getMessage(
      (e as KeychainError).message,
      (e as KeychainError).messageParams,
    );
  } finally {
    return createMessage(
      err,
      result,
      data,
      await chrome.i18n.getMessage('bgd_ops_remove_auth', [
        data.role.toLowerCase(),
        data.authorizedUsername,
        data.username,
      ]),
      err_message,
    );
  }
};

export const broadcastAddKeyAuthority = async (
  requestHandler: RequestsHandler,
  data: RequestAddKeyAuthority & RequestId,
) => {
  let result, err, err_message;

  const { username, authorizedKey } = data;
  let role = data.role.toLowerCase();

  let { weight } = data;
  try {
    const key = requestHandler.data.key;
    const userAccount = await AccountUtils.getExtendedAccount(username);
    const updatedAuthority = userAccount[role as 'posting' | 'active'];

    /** Release callback if the key already exist in the key_auths array */
    const authorizedKeys = updatedAuthority.key_auths.map((auth) => auth[0]);
    const hasAuthority = authorizedKeys.indexOf(authorizedKey) !== -1;
    if (hasAuthority) {
      throw new KeychainError('already_has_authority_error');
    }

    /** Use weight_thresold as default weight */
    weight =
      weight || userAccount[role as 'posting' | 'active'].weight_threshold;
    updatedAuthority.key_auths.push([authorizedKey, +weight]);
    updatedAuthority.key_auths.sort((a, b) =>
      (a[0] as string).localeCompare(b[0] as string),
    );

    const active =
      role === KeychainKeyTypesLC.active ? updatedAuthority : undefined;
    const posting =
      role === KeychainKeyTypesLC.posting ? updatedAuthority : undefined;

    /** Add authority on user account */

    result = await AccountUtils.updateAccount(
      userAccount.name,
      active,
      posting,
      userAccount.memo_key,
      userAccount.json_metadata,
      key!,
    );
  } catch (e) {
    Logger.error(e);
    err = (e as KeychainError).trace || e;
    err_message = await chrome.i18n.getMessage(
      (e as KeychainError).message,
      (e as KeychainError).messageParams,
    );
  } finally {
    return createMessage(
      err,
      result,
      data,
      await chrome.i18n.getMessage('bgd_ops_add_key_auth', [
        data.authorizedKey,
        await chrome.i18n.getMessage(data.role.toLowerCase()),
        data.username,
        data.weight + '',
      ]),
      err_message,
    );
  }
};

export const broadcastRemoveKeyAuthority = async (
  requestHandler: RequestsHandler,
  data: RequestRemoveKeyAuthority & RequestId,
) => {
  let err, result, err_message;
  const { username, authorizedKey } = data;
  let role = data.role.toLowerCase();

  try {
    const key = requestHandler.data.key;

    const userAccount = await AccountUtils.getExtendedAccount(username);

    const updatedAuthority = userAccount[role as 'posting' | 'active'];
    const totalAuthorizedKey = updatedAuthority.key_auths.length;
    for (let i = 0; i < totalAuthorizedKey; i++) {
      const user = updatedAuthority.key_auths[i];
      if (user[0] === authorizedKey) {
        updatedAuthority.key_auths.splice(i, 1);
        break;
      }
    }

    /** Release callback if the key does not exist in the key_auths array */
    if (totalAuthorizedKey === updatedAuthority.key_auths.length) {
      throw new KeychainError('missing_authority_error');
    }

    const active =
      role === KeychainKeyTypesLC.active ? updatedAuthority : undefined;
    const posting =
      role === KeychainKeyTypesLC.posting ? updatedAuthority : undefined;

    result = await AccountUtils.updateAccount(
      userAccount.name,
      active,
      posting,
      userAccount.memo_key,
      userAccount.json_metadata,
      key!,
    );
  } catch (e) {
    Logger.error(e);
    err = (e as KeychainError).trace || e;
    err_message = await chrome.i18n.getMessage(
      (e as KeychainError).message,
      (e as KeychainError).messageParams,
    );
  } finally {
    return createMessage(
      err,
      result,
      data,
      await chrome.i18n.getMessage('bgd_ops_remove_key_auth', [
        data.authorizedKey,
        await chrome.i18n.getMessage(data.role.toLowerCase()),
        data.username,
      ]),
      err_message,
    );
  }
};
