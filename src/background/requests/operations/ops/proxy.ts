import { RequestsHandler } from '@background/requests';
import {
  beautifyErrorMessage,
  createMessage,
} from '@background/requests/operations/operations.utils';
import { AccountWitnessProxyOperation, PrivateKey } from '@hiveio/dhive';
import {
  KeychainKeyTypesLC,
  RequestId,
  RequestProxy,
} from '@interfaces/keychain.interface';

export const broadcastProxy = async (
  requestHandler: RequestsHandler,
  data: RequestProxy & RequestId,
) => {
  const client = requestHandler.getHiveClient();
  let result, err;

  try {
    let key = requestHandler.data.key;
    if (!key) {
      [key] = requestHandler.getUserKey(
        data.username!,
        KeychainKeyTypesLC.active,
      ) as [string, string];
    }
    result = await client.broadcast.sendOperations(
      [
        [
          'account_witness_proxy',
          {
            account: data.username,
            proxy: data.proxy,
          },
        ] as AccountWitnessProxyOperation,
      ],
      PrivateKey.from(key!),
    );
  } catch (e) {
    err = e;
  } finally {
    const err_message = await beautifyErrorMessage(err);
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
