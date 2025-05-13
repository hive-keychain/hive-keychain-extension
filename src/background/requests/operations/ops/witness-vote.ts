import LedgerModule from '@background/ledger.module';
import { createMessage } from '@background/requests/operations/operations.utils';
import { RequestsHandler } from '@background/requests/request-handler';
import {
  KeychainKeyTypesLC,
  RequestId,
  RequestWitnessVote,
} from '@interfaces/keychain.interface';
import { PrivateKeyType, TransactionOptions } from '@interfaces/keys.interface';
import { Witness } from '@interfaces/witness.interface';
import { KeychainError } from 'src/keychain-error';
import { HiveTxUtils } from 'src/popup/hive/utils/hive-tx.utils';
import { KeysUtils } from 'src/popup/hive/utils/keys.utils';
import WitnessUtils from 'src/popup/hive/utils/witness.utils';

export const broadcastWitnessVote = async (
  requestHandler: RequestsHandler,
  data: RequestWitnessVote & RequestId,
  options?: TransactionOptions,
) => {
  let result,
    err,
    err_message = null;

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
        const tx = await WitnessUtils.getUpdateWitnessTransaction(
          data.username!,
          { name: data.witness },
          data.vote,
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
        result = await WitnessUtils.updateWitnessVote(
          data.username!,
          { name: data.witness } as Witness,
          data.vote,
          key,
          options,
        );
        break;
      }
    }
  } catch (e: any) {
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
      data.vote
        ? await chrome.i18n.getMessage('bgd_ops_witness_voted', [data.witness])
        : await chrome.i18n.getMessage('bgd_ops_witness_unvoted', [
            data.witness,
          ]),
      err_message,
    );
    return message;
  }
};
