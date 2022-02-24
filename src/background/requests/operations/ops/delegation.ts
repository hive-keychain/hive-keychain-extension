import { RequestsHandler } from '@background/requests';
import {
  beautifyErrorMessage,
  createMessage,
} from '@background/requests/operations/operations.utils';
import { PrivateKey } from '@hiveio/dhive';
import {
  KeychainKeyTypesLC,
  RequestDelegation,
  RequestId,
} from '@interfaces/keychain.interface';

export const broadcastDelegation = async (
  requestHandler: RequestsHandler,
  data: RequestDelegation & RequestId,
) => {
  const client = requestHandler.getHiveClient();
  let key = requestHandler.data.key;
  if (!key) {
    [key] = requestHandler.getUserKey(
      data.username!,
      KeychainKeyTypesLC.active,
    ) as [string, string];
  }
  let result, err;

  try {
    const global = await client.database.getDynamicGlobalProperties();
    let delegated_vest = null;
    if (data.unit === 'HP') {
      const totalHive = global.total_vesting_fund_hive
        ? Number((global.total_vesting_fund_hive as string).split(' ')[0])
        : Number(global.total_vesting_fund_hive.split(' ')[0]);
      const totalVests = Number(
        (global.total_vesting_shares as string).split(' ')[0],
      );
      delegated_vest = (parseFloat(data.amount) * totalVests) / totalHive;
      delegated_vest = delegated_vest.toFixed(6);
      delegated_vest = delegated_vest.toString() + ' VESTS';
    } else {
      delegated_vest = data.amount + ' VESTS';
    }
    result = await client.broadcast.delegateVestingShares(
      {
        delegator: data.username!,
        delegatee: data.delegatee,
        vesting_shares: delegated_vest,
      },
      PrivateKey.from(key!),
    );
  } catch (e) {
    err = e;
  } finally {
    const err_message = beautifyErrorMessage(err);
    return createMessage(
      err,
      result,
      data,
      parseFloat(data.amount) === 0
        ? chrome.i18n.getMessage('bgd_ops_undelegate', [
            data.delegatee,
            data.username!,
          ])
        : chrome.i18n.getMessage('bgd_ops_delegate', [
            `${data.amount} ${data.unit}`,
            data.delegatee,
            data.username!,
          ]),
      err_message,
    );
  }
};
