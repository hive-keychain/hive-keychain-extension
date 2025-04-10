import HiveLedgerApp from '@engrave/ledger-app-hive';
import type { Transaction } from '@hiveio/dhive';
import { Key } from '@interfaces/keys.interface';
import { LoadingOperation } from '@popup/multichain/reducers/loading.reducer';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import React, { useEffect, useState } from 'react';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import { KeychainError } from 'src/keychain-error';
import { ErrorUtils } from 'src/popup/hive/utils/error.utils';
import { LedgerUtils } from 'src/utils/ledger.utils';
import Logger from 'src/utils/logger.utils';
type Props = {
  data: SignFromLedgerRequestMessage;
};
export type SignFromLedgerRequestMessage = {
  transaction: Transaction;
  key: Key;
};

const SignTransaction = (props: Props) => {
  const [loadingOperations, setLoadingOperations] = useState<
    LoadingOperation[]
  >([{ name: 'html_popup_waiting_for_ledger_confirmation', done: false }]);

  useEffect(() => {
    signTransaction(props.data);
  }, []);

  const signTransaction = async (data: SignFromLedgerRequestMessage) => {
    const operations: LoadingOperation[] = [
      { name: 'html_popup_waiting_for_ledger_confirmation', done: false },
      { name: 'html_popup_broadcasting_transaction', done: false },
    ];

    setInterval(() => {
      chrome.runtime.sendMessage({
        command: DialogCommand.PING,
      });
    }, 5000);

    try {
      let signature;
      if (!HiveLedgerApp.isDisplayableOnDevice(data.transaction)) {
        let hashSignPolicy;
        try {
          hashSignPolicy = (await LedgerUtils.getSettings()).hashSignPolicy;
        } catch (err: any) {
          throw ErrorUtils.parseLedger(err);
        }

        if (!hashSignPolicy) {
          throw new KeychainError('error_ledger_no_hash_sign_policy');
        }
        const digest = HiveLedgerApp.getTransactionDigest(data.transaction);
        const splitedDigest: string[] = digest.match(/.{1,17}/g) as string[];
        operations.unshift({
          name: 'ledger_signing_hash',
          operationParams: [splitedDigest.join('<br />')],
          done: false,
          hideDots: true,
        });
        setLoadingOperations(operations);
        signature = await LedgerUtils.signHash(digest, data.key!);
        operations[1].done = true;
      } else {
        setLoadingOperations(operations);
        const signedTransaction = await LedgerUtils.signTransaction(
          data.transaction,
          data.key!,
        );
        signature = signedTransaction.signatures[0];
        operations[0].done = true;
      }

      setLoadingOperations(operations);
      chrome.runtime.sendMessage({
        command: DialogCommand.RETURN_SIGNATURE,
        signature: signature,
      });
    } catch (err: any) {
      Logger.log(err);
      let message = 'html_ledger_error_while_signing';
      if (err instanceof KeychainError) {
        message = err.message;
      }
      chrome.runtime.sendMessage({
        command: DialogCommand.RETURN_ERROR_SIGNING_TRANSACTION,
        message: message,
      });
    }
  };

  return (
    <div className="sign-transaction-with-ledger">
      <LoadingComponent operations={loadingOperations} hide={false} />
    </div>
  );
};

export default SignTransaction;
