import { RequestsHandler } from '@background/requests';
import {
  beautifyErrorMessage,
  createMessage,
} from '@background/requests/operations/operations.utils';
import {
  Client,
  CollateralizedConvertOperation,
  ConvertOperation,
  PrivateKey,
} from '@hiveio/dhive';
import { RequestConvert, RequestId } from '@interfaces/keychain.interface';
import CurrencyUtils from 'src/utils/currency.utils';

export const convert = async (
  requestHandler: RequestsHandler,
  data: RequestConvert & RequestId,
) => {
  const { username, amount, collaterized } = data;
  const client = requestHandler.getHiveClient();
  const key = requestHandler.data.key;
  const rpc = requestHandler.data.rpc;
  const requestid = await getNextRequestID(username, client);
  let result, err;
  if (collaterized) {
    try {
      result = await client.broadcast.sendOperations(
        [
          [
            'collateralized_convert',
            {
              owner: username,
              requestid,
              amount: `${amount} ${CurrencyUtils.getCurrencyLabel(
                'HIVE',
                rpc!.testnet,
              )}`,
            },
          ] as CollateralizedConvertOperation,
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
        await chrome.i18n.getMessage('bgd_ops_convert_collaterized', [
          amount,
          username,
        ]),
        err_message,
      );
      return message;
    }
  } else {
    try {
      result = await client.broadcast.sendOperations(
        [
          [
            'convert',
            {
              owner: username,
              requestid,
              amount: `${amount} ${CurrencyUtils.getCurrencyLabel(
                'HBD',
                rpc!.testnet,
              )}`,
            },
          ] as ConvertOperation,
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
        await chrome.i18n.getMessage('bgd_ops_convert', [amount, username]),
        err_message,
      );
      return message;
    }
  }
};

const getNextRequestID = async (username: string, client: Client) => {
  let conversions = await client.database.call('get_conversion_requests', [
    username,
  ]);
  let collateralized_conversions = await client.database.call(
    'get_collateralized_conversion_requests',
    [username],
  );
  if (!collateralized_conversions) collateralized_conversions = [];
  const conv = [...conversions, ...collateralized_conversions];

  return Math.max(...conv.map((e) => e.requestid), 0) + 1;
};
