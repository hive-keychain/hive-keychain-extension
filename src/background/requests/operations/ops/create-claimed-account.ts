import { createMessage } from '@background/requests/operations/operations.utils';
import { RequestsHandler } from '@background/requests/request-handler';
import {
  RequestCreateClaimedAccount,
  RequestId,
} from '@interfaces/keychain.interface';
import { KeychainError } from 'src/keychain-error';
import {
  AccountCreationType,
  AccountCreationUtils,
} from 'src/utils/account-creation.utils';
import Logger from 'src/utils/logger.utils';

export const broadcastCreateClaimedAccount = async (
  requestHandler: RequestsHandler,
  data: RequestCreateClaimedAccount & RequestId,
) => {
  let err, result, err_message;
  let key = requestHandler.data.key;
  try {
    const accountAuthorities = {
      owner: JSON.parse(data.owner),
      active: JSON.parse(data.active),
      posting: JSON.parse(data.posting),
      memo_key: data.memo,
    };
    result = await AccountCreationUtils.createAccount(
      AccountCreationType.USING_TICKET,
      data.new_account,
      data.username,
      key!,
      accountAuthorities,
    );
  } catch (e) {
    Logger.error(e);
    err = (e as KeychainError).trace || e;
    err_message = await chrome.i18n.getMessage(
      (e as KeychainError).message,
      (e as KeychainError).messageParams,
    );
  } finally {
    const message = createMessage(
      err,
      result,
      data,
      await chrome.i18n.getMessage('bgd_ops_create_account', [
        data.new_account,
      ]),
      err_message,
    );
    return message;
  }
};
