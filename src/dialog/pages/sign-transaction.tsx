import { Transaction } from '@hiveio/dhive';
import { Key } from '@interfaces/keys.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import React, { useEffect } from 'react';
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
  useEffect(() => {
    signTransaction(props.data);
  }, []);

  const signTransaction = async (data: SignFromLedgerRequestMessage) => {
    try {
      const signedTransaction = await LedgerUtils.signTransaction(
        data.transaction,
        data.key!,
      );
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
      <LoadingComponent
        operations={[
          { name: 'html_popup_waiting_for_ledger_confirmation', done: false },
        ]}
        hide={false}
      />
    </div>
  );
};

export default SignTransaction;
