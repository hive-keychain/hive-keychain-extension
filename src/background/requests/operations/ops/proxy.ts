import LedgerModule from '@background/ledger.module';
import { createMessage } from '@background/requests/operations/operations.utils';
import { RequestsHandler } from '@background/requests/request-handler';
import {
  KeychainKeyTypesLC,
  RequestId,
  RequestProxy,
} from '@interfaces/keychain.interface';
import { PrivateKeyType, TransactionOptions } from '@interfaces/keys.interface';
import { KeychainError } from 'src/keychain-error';
import { HiveTxUtils } from 'src/popup/hive/utils/hive-tx.utils';
import { KeysUtils } from 'src/popup/hive/utils/keys.utils';
import ProxyUtils from 'src/popup/hive/utils/proxy.utils';
import Logger from 'src/utils/logger.utils';

export const broadcastProxy = async (
  requestHandler: RequestsHandler,
  data: RequestProxy & RequestId,
  options?: TransactionOptions,
) => {
  let result, err, err_message;

  try {
    let key = requestHandler.data.key;
    if (!key) {
      [key] = requestHandler.getUserKeyPair(
        data.username!,
        KeychainKeyTypesLC.active,
      ) as [string, string];
    }

    switch (KeysUtils.getKeyType(key!)) {
      case PrivateKeyType.LEDGER: {
        const tx = await ProxyUtils.getSetProxyTransaction(
          data.proxy,
          data.username!,
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
        result = await ProxyUtils.setAsProxy(
          data.proxy,
          data.username!,
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
    const message = await createMessage(
      err,
      result,
      data,
      data.proxy.length
        ? await chrome.i18n.getMessage('popup_success_proxy', [data.proxy])
        : await chrome.i18n.getMessage('bgd_ops_unproxy'),
      err_message,
    );
    return message;
  }
};
