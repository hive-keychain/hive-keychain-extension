import { Transaction } from '@hiveio/dhive';
import { Key } from '@interfaces/keys.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import React, { useEffect, useState } from 'react';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import { LedgerUtils } from 'src/utils/ledger.utils';
import Logger from 'src/utils/logger.utils';
import './sign-transaction.scss';

type Props = {
  data: SignFromLedgerRequestMessage;
};

export type SignFromLedgerRequestMessage = {
  transaction: Transaction;
  key: Key;
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
      const signedTransaction = await LedgerUtils.signTransaction(
        data.transaction,
        data.key!,
      );
      setLoadingOperations([
        { name: 'html_popup_waiting_for_ledger_confirmation', done: true },
        { name: 'html_popup_broadcasting_transaction', done: false },
      ]);
      chrome.runtime.sendMessage({
        command: DialogCommand.RETURN_SIGNED_TRANSACTION,
        signedTransaction: signedTransaction,
      });
    } catch (err: any) {
      Logger.log(err);
      chrome.runtime.sendMessage({
        command: DialogCommand.RETURN_ERROR_SIGNING_TRANSACTION,
        message: 'html_ledger_error_while_signing',
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
