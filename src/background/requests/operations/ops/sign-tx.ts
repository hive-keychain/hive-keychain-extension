import { getRequestHandler } from '@background/requests';
import {
  beautifyErrorMessage,
  createMessage,
} from '@background/requests/operations/operations.utils';
import hive from '@hiveio/hive-js';
import { RequestId, RequestSignTx } from '@interfaces/keychain.interface';
export const signTx = async (data: RequestSignTx & RequestId) => {
  const client = getRequestHandler().getHiveClient();
  let key = getRequestHandler().key;
  let result, err;

  try {
    console.log('good til here', data.tx, key);
    //result = client.broadcast.sign(data.tx, PrivateKey.from(key!));
    result = await hive.auth.signTransaction(data.tx, [key]);
    console.log('oopsy');
  } catch (e) {
    err = e;
  } finally {
    const err_message = beautifyErrorMessage(err);

    const message = createMessage(
      err,
      result,
      data,
      chrome.i18n.getMessage('bgd_ops_sign_tx'),
      err_message,
    );
    return message;
  }
};
