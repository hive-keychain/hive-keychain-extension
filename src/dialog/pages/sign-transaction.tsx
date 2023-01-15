import HiveLedgerApp from '@engrave/ledger-app-hive';
import { Transaction } from '@hiveio/dhive';
import { Key } from '@interfaces/keys.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import React, { useEffect, useState } from 'react';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import { KeychainError } from 'src/keychain-error';
import { LedgerUtils } from 'src/utils/ledger.utils';
import Logger from 'src/utils/logger.utils';
import './sign-transaction.scss';

type Props = {
  data: SignFromLedgerRequestMessage;
};

export type SignFromLedgerRequestMessage = {
  transaction: Transaction;
  key: Key;
  signHash?: boolean;
};

const SignTransaction = (props: Props) => {
  const [loadingOperations, setLoadingOperations] = useState([
    { name: 'html_popup_waiting_for_ledger_confirmation', done: false },
  ]);

  useEffect(() => {
    signTransaction(props.data);
  }, []);

  const signTransaction = async (data: SignFromLedgerRequestMessage) => {
    try {
      let signature;
      if (data.signHash) {
        const { hashSignPolicy } = await LedgerUtils.getSettings();
        if (!hashSignPolicy) {
          throw new KeychainError('error_ledger_no_hash_sign_policy');
        }
        const digest = HiveLedgerApp.getTransactionDigest(data.transaction);
        signature = await LedgerUtils.signHash(digest, data.key!);
      } else {
        const signedTransaction = await LedgerUtils.signTransaction(
          data.transaction,
          data.key!,
        );
        signature = signedTransaction.signatures[0];
      }
      setLoadingOperations([
        { name: 'html_popup_waiting_for_ledger_confirmation', done: true },
        { name: 'html_popup_broadcasting_transaction', done: false },
      ]);
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
