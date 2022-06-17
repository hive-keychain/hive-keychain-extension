import { RequestsHandler } from '@background/requests';
import { createMessage } from '@background/requests/operations/operations.utils';
import { PrivateKey } from '@hiveio/dhive';
import { RequestId, RequestSendToken } from '@interfaces/keychain.interface';
import Config from 'src/config';
//import HiveEngineUtils from 'src/utils/hive-engine.utils';

export const broadcastSendToken = async (
  requestHandler: RequestsHandler,
  data: RequestSendToken & RequestId,
) => {
  let err, result;
  const client = requestHandler.getHiveClient();
  let key = requestHandler.data.key;
  try {
    const id = Config.hiveEngine.MAINNET;
    const json = JSON.stringify({
      contractName: 'tokens',
      contractAction: 'transfer',
      contractPayload: {
        symbol: data.currency,
        to: data.to,
        quantity: data.amount,
        memo: data.memo,
      },
    });
    result = await client.broadcast.json(
      { required_posting_auths: [], required_auths: [data.username], id, json },
      PrivateKey.from(key!),
    );
  } catch (e) {
    err = e;
  } finally {
    const message = createMessage(
      err,
      result,
      data,
      await chrome.i18n.getMessage('bgd_ops_tokens'),
      await chrome.i18n.getMessage('bgd_ops_error_broadcasting'),
    );
    return message;
  }
};
