import { createMessage } from '@background/requests/operations/operations.utils';
import { RequestsHandler } from '@background/requests/request-handler';
import {
  KeychainKeyTypesLC,
  RequestCustomJSON,
  RequestId,
} from '@interfaces/keychain.interface';
import { KeyType } from '@interfaces/keys.interface';
import { KeychainError } from 'src/keychain-error';
import { CustomJsonUtils } from 'src/utils/custom-json.utils';
import Logger from 'src/utils/logger.utils';

export const broadcastCustomJson = async (
  requestHandler: RequestsHandler,
  data: RequestCustomJSON & RequestId,
) => {
  let key = requestHandler.data.key;
  if (!key) {
    [key] = requestHandler.getUserKeyPair(
      data.username!,
      data.method.toLowerCase() as KeychainKeyTypesLC,
    ) as [string, string];
  }
  let result, err, err_message;

  try {
    result = await CustomJsonUtils.send(
      data.json,
      data.username!,
      key!,
      data.method.toUpperCase() as KeyType,
      data.id,
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
      await chrome.i18n.getMessage('bgd_ops_broadcast'),
      err_message,
    );

    return message;
  }
};
