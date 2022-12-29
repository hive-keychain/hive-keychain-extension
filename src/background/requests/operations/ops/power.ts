import { RequestsHandler } from '@background/requests';
import { createMessage } from '@background/requests/operations/operations.utils';
import {
  RequestId,
  RequestPowerDown,
  RequestPowerUp,
} from '@interfaces/keychain.interface';
import { KeychainError } from 'src/keychain-error';
import { DynamicGlobalPropertiesUtils } from 'src/utils/dynamic-global-properties.utils';
import Logger from 'src/utils/logger.utils';
import { PowerUtils } from 'src/utils/power.utils';

export const broadcastPowerUp = async (
  requestHandler: RequestsHandler,
  data: RequestPowerUp & RequestId,
) => {
  let key = requestHandler.data.key;

  let result, err, err_message;

  try {
    result = await PowerUtils.powerUp(
      data.username,
      data.recipient,
      `${data.hive} HIVE`,
      key!,
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
  let key = requestHandler.data.key;

  let result, err, err_message;
  try {
    const res = await DynamicGlobalPropertiesUtils.getDynamicGlobalProperties();

    console.log(res);

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

    result = await PowerUtils.powerDown(data.username, vestingShares, key!);
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
