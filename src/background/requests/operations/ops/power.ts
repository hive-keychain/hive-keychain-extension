import { RequestsHandler } from '@background/requests';
import {
  beautifyErrorMessage,
  createMessage,
} from '@background/requests/operations/operations.utils';
import {
  PrivateKey,
  TransferToVestingOperation,
  WithdrawVestingOperation,
} from '@hiveio/dhive';
import {
  RequestId,
  RequestPowerDown,
  RequestPowerUp,
} from '@interfaces/keychain.interface';

export const broadcastPowerUp = async (
  requestHandler: RequestsHandler,
  data: RequestPowerUp & RequestId,
) => {
  const client = requestHandler.getHiveClient();
  let key = requestHandler.data.key;

  let result, err;

  try {
    result = await client.broadcast.sendOperations(
      [
        [
          'transfer_to_vesting',
          {
            from: data.username,
            to: data.recipient,
            amount: `${data.hive} HIVE`,
          },
        ] as TransferToVestingOperation,
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
      await chrome.i18n.getMessage('bgd_ops_pu', [data.hive, data.recipient]),
      err_message,
    );
    return message;
  }
};

export const broadcastPowerDown = async (
  requestHandler: RequestsHandler,
  data: RequestPowerDown & RequestId,
) => {
  const client = requestHandler.getHiveClient();
  let key = requestHandler.data.key;

  let result, err;
  try {
    const res = await client.database.getDynamicGlobalProperties();
    let vestingShares = null;
    const totalSteem = res.total_vesting_fund_hive
      ? Number((res.total_vesting_fund_hive as string).split(' ')[0])
      : Number(res.total_vesting_fund_hive.split(' ')[0]);
    const totalVests = Number(
      (res.total_vesting_shares as string).split(' ')[0],
    );
    vestingShares = (parseFloat(data.hive_power) * totalVests) / totalSteem;
    vestingShares = vestingShares.toFixed(6);
    vestingShares = vestingShares.toString() + ' VESTS';

    result = await client.broadcast.sendOperations(
      [
        [
          'withdraw_vesting',
          { account: data.username, vesting_shares: vestingShares },
        ] as WithdrawVestingOperation,
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
      parseFloat(data.hive_power) == 0
        ? await chrome.i18n.getMessage('bgd_ops_pd_stop', [data.username])
        : await chrome.i18n.getMessage('bgd_ops_pd', [
            data.hive_power,
            data.username,
          ]),
      err_message,
    );
    return message;
  }
};
