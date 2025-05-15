import LedgerModule from '@background/ledger.module';
import { createMessage } from '@background/requests/operations/operations.utils';
import { RequestsHandler } from '@background/requests/request-handler';
import { KeychainKeyTypesLC, RequestId } from '@interfaces/keychain.interface';
import { KeyType, PrivateKeyType } from '@interfaces/keys.interface';
import { CustomJsonUtils } from '@popup/hive/utils/custom-json.utils';
import { RequestVscWithdrawal, VscUtils } from 'hive-keychain-commons';
import Config from 'src/config';
import { KeychainError } from 'src/keychain-error';
import { HiveTxUtils } from 'src/popup/hive/utils/hive-tx.utils';
import { KeysUtils } from 'src/popup/hive/utils/keys.utils';
import Logger from 'src/utils/logger.utils';

export const vscWithdrawal = async (
  requestHandler: RequestsHandler,
  data: RequestVscWithdrawal & RequestId,
) => {
  const { json, id: JSON_ID } = VscUtils.getWithdrawJson(
    data,
    Config.vsc.BASE_JSON.net_id,
  );
  let key = requestHandler.data.key;
  if (!key) {
    [key] = requestHandler.getUserKeyPair(
      data.username!,
      KeychainKeyTypesLC.active,
    ) as [string, string];
  }
  let result, err, err_message;

  try {
    switch (KeysUtils.getKeyType(key!)) {
      case PrivateKeyType.LEDGER: {
        const tx = await CustomJsonUtils.getCustomJsonTransaction(
          json,
          data.username!,
          KeyType.ACTIVE,
          JSON_ID,
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
        result = await CustomJsonUtils.send(
          json,
          data.username!,
          key!,
          KeyType.ACTIVE,
          JSON_ID,
        );
        break;
      }
    }
    requestHandler.setIsWaitingForConfirmation(true);
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
      await chrome.i18n.getMessage('bgd_ops_vsc_broadcast'),
      err_message,
    );

    return message;
  }
};
