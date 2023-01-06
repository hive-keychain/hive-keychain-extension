import { createMessage } from '@background/requests/operations/operations.utils';
import { RequestsHandler } from '@background/requests/request-handler';
import {
  KeychainKeyTypesLC,
  RequestId,
  RequestProxy,
} from '@interfaces/keychain.interface';
import { KeychainError } from 'src/keychain-error';
import Logger from 'src/utils/logger.utils';
import ProxyUtils from 'src/utils/proxy.utils';

export const broadcastProxy = async (
  requestHandler: RequestsHandler,
  data: RequestProxy & RequestId,
) => {
  let result, err, err_message;

  try {
    let key = requestHandler.data.key;
    if (!key) {
      [key] = requestHandler.getUserKeyPair(
        data.username!,
        KeychainKeyTypesLC.active,
      ) as [string, string];
    }
    result = await ProxyUtils.setAsProxy(data.proxy, data.username!, key);
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
      data.proxy.length
        ? await chrome.i18n.getMessage('popup_success_proxy', [data.proxy])
        : await chrome.i18n.getMessage('bgd_ops_unproxy'),
      err_message,
    );
    return message;
  }
};
