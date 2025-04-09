import LedgerModule from '@background/ledger.module';
import { createMessage } from '@background/requests/operations/operations.utils';
import { RequestsHandler } from '@background/requests/request-handler';
import {
  KeychainKeyTypesLC,
  RequestDelegation,
  RequestId,
} from '@interfaces/keychain.interface';
import { PrivateKeyType, TransactionOptions } from '@interfaces/keys.interface';
import { KeychainError } from 'src/keychain-error';
import { DelegationUtils } from 'src/popup/hive/utils/delegation.utils';
import { DynamicGlobalPropertiesUtils } from 'src/popup/hive/utils/dynamic-global-properties.utils';
import { HiveTxUtils } from 'src/popup/hive/utils/hive-tx.utils';
import { KeysUtils } from 'src/popup/hive/utils/keys.utils';
import Logger from 'src/utils/logger.utils';

export const broadcastDelegation = async (
  requestHandler: RequestsHandler,
  data: RequestDelegation & RequestId,
  options?: TransactionOptions,
) => {
  let key = requestHandler.data.key;
  if (!key) {
    [key] = requestHandler.getUserKeyPair(
      data.username!,
      KeychainKeyTypesLC.active,
    ) as [string, string];
  }
  let result, err, err_message;

  try {
    const global =
      await DynamicGlobalPropertiesUtils.getDynamicGlobalProperties();
    let delegatedVests = null;
    if (data.unit === 'HP') {
      const totalHive = global.total_vesting_fund_hive
        ? Number((global.total_vesting_fund_hive as string).split(' ')[0])
        : Number(global.total_vesting_fund_hive.split(' ')[0]);
      const totalVests = Number(
        (global.total_vesting_shares as string).split(' ')[0],
      );
      delegatedVests = (parseFloat(data.amount) * totalVests) / totalHive;
      delegatedVests = delegatedVests.toFixed(6);
      delegatedVests = delegatedVests.toString() + ' VESTS';
    } else {
      delegatedVests = data.amount + ' VESTS';
    }

    switch (KeysUtils.getKeyType(key!)) {
      case PrivateKeyType.LEDGER: {
        const tx = await DelegationUtils.getDelegationTransaction(
          data.delegatee,
          data.username!,
          delegatedVests,
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
        result = await DelegationUtils.delegateVestingShares(
          data.username!,
          data.delegatee,
          delegatedVests,
          key,
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
    return await createMessage(
      err,
      result,
      data,
      parseFloat(data.amount) === 0
        ? await chrome.i18n.getMessage('bgd_ops_undelegate', [
            data.delegatee,
            data.username!,
          ])
        : await chrome.i18n.getMessage('bgd_ops_delegate', [
            `${data.amount} ${data.unit}`,
            data.delegatee,
            data.username!,
          ]),
      err_message,
    );
  }
};
