import { getRequestHandler } from '@background/requests';
import {
  beautifyErrorMessage,
  createMessage,
} from '@background/requests/operations/operations.utils';
import { PrivateKey } from '@hiveio/dhive';
import {
  KeychainKeyTypesLC,
  RequestCustomJSON,
  RequestId,
} from '@interfaces/keychain.interface';

export const broadcastCustomJson = async (
  data: RequestCustomJSON & RequestId,
) => {
  const client = getRequestHandler().getHiveClient();
  const key = getRequestHandler().key;
  let result, err;

  try {
    result = await client.broadcast.json(
      {
        required_auths:
          data.method.toLowerCase() === KeychainKeyTypesLC.active
            ? [data.username!]
            : [],
        required_posting_auths:
          data.method.toLowerCase() === KeychainKeyTypesLC.posting
            ? [data.username!]
            : [],
        id: data.id,
        json: data.json,
      },
      PrivateKey.from(key!),
    );
  } catch (e) {
    err = e;
  }

  const err_message = beautifyErrorMessage(err);

  const message = createMessage(
    err,
    result,
    data,
    chrome.i18n.getMessage('bgd_ops_broadcast'),
    err_message,
  );

  return message;
};
