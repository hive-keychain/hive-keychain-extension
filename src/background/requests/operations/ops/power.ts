import LedgerModule from '@background/ledger.module';
import { createMessage } from '@background/requests/operations/operations.utils';
import { RequestsHandler } from '@background/requests/request-handler';
import {
  RequestId,
  RequestPowerDown,
  RequestPowerUp,
} from '@interfaces/keychain.interface';
import { PrivateKeyType, TransactionOptions } from '@interfaces/keys.interface';
import { KeychainError } from 'src/keychain-error';
import { DynamicGlobalPropertiesUtils } from 'src/popup/hive/utils/dynamic-global-properties.utils';
import { HiveTxUtils } from 'src/popup/hive/utils/hive-tx.utils';
import { KeysUtils } from 'src/popup/hive/utils/keys.utils';
import { PowerUtils } from 'src/popup/hive/utils/power.utils';
import Logger from 'src/utils/logger.utils';

export const broadcastPowerUp = async (
  requestHandler: RequestsHandler,
  data: RequestPowerUp & RequestId,
  options?: TransactionOptions,
) => {
  let key = requestHandler.data.key;

  let result, err, err_message;

  try {
    switch (KeysUtils.getKeyType(key!)) {
      case PrivateKeyType.LEDGER: {
        const tx = await PowerUtils.getPowerUpTransaction(
          data.username,
          data.recipient,
          `${data.hive} HIVE`,
        );
        LedgerModule.signTransactionFromLedger({
          transaction: tx,
          key: key!,
        });
        const signature = await LedgerModule.getSignatureFromLedger();
        result = await HiveTxUtils.broadcastAndConfirmTransactionWithSignature(
          tx,
          signature,
        );
        break;
      }
      default: {
        result = await PowerUtils.powerUp(
          data.username,
          data.recipient,
          `${data.hive} HIVE`,
          key!,
          options,
        );
        break;
      }
    }
  } catch (e) {
    Logger.error(e);
    err = (e as KeychainError).trace || e;
    err_message = await chrome.i18n.getMessage(
      (e as KeychainError).message,
      (e as KeychainError).messageParams,
    );
  } finally {
    const message = await createMessage(
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
  options?: TransactionOptions,
) => {
  let key = requestHandler.data.key;

  let result, err, err_message;
  try {
    const res = await DynamicGlobalPropertiesUtils.getDynamicGlobalProperties();

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

    switch (KeysUtils.getKeyType(key!)) {
      case PrivateKeyType.LEDGER: {
        const tx = await PowerUtils.getPowerDownTransaction(
          data.username,
          vestingShares,
        );
        LedgerModule.signTransactionFromLedger({
          transaction: tx,
          key: key!,
        });
        const signature = await LedgerModule.getSignatureFromLedger();
        result = await HiveTxUtils.broadcastAndConfirmTransactionWithSignature(
          tx,
          signature,
        );
        break;
      }
      default: {
        result = await PowerUtils.powerDown(
          data.username,
          vestingShares,
          key!,
          options,
        );
        break;
      }
    }
  } catch (e) {
    Logger.error(e);
    err = (e as KeychainError).trace || e;
    err_message = await chrome.i18n.getMessage(
      (e as KeychainError).message,
      (e as KeychainError).messageParams,
    );
  } finally {
    const message = await createMessage(
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
