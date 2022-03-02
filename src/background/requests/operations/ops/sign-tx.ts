import { RequestsHandler } from '@background/requests';
import {
  beautifyErrorMessage,
  createMessage,
} from '@background/requests/operations/operations.utils';
import { signTransaction } from '@hiveio/hive-js/lib/auth';
import { RequestId, RequestSignTx } from '@interfaces/keychain.interface';
export const signTx = async (
  requestHandler: RequestsHandler,
  data: RequestSignTx & RequestId,
) => {
  let key = requestHandler.data.key;
  let result, err;

  try {
    //result = client.broadcast.sign(data.tx, PrivateKey.from(key!));
    result = await signTransaction(data.tx, [key]);
  } catch (e) {
    err = e;
  } finally {
    const err_message = await beautifyErrorMessage(err);

    const message = createMessage(
      err,
      result,
      data,
      await chrome.i18n.getMessage('bgd_ops_sign_tx'),
      err_message,
    );
    return message;
  }
};
