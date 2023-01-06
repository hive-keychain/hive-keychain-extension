import { createMessage } from '@background/requests/operations/operations.utils';
import { RequestsHandler } from '@background/requests/request-handler';
import { RequestId, RequestSendToken } from '@interfaces/keychain.interface';
import { KeychainError } from 'src/keychain-error';
import TokensUtils from 'src/utils/tokens.utils';

export const broadcastSendToken = async (
  requestHandler: RequestsHandler,
  data: RequestSendToken & RequestId,
) => {
  let err, err_message, result;
  let key = requestHandler.data.key;
  try {
    result = await TokensUtils.sendToken(
      data.currency,
      data.to,
      data.amount,
      data.memo,
      key!,
      data.username,
    );
  } catch (e: any) {
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
      await chrome.i18n.getMessage('bgd_ops_tokens'),
      err_message,
    );
    return message;
  }
};
