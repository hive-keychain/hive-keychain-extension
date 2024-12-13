import { EvmRequest } from '@interfaces/evm-provider.interface';
import { TransactionConfirmationFields } from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmTransactionParserUtils } from '@popup/evm/utils/evm-transaction-parser.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import React, { useEffect } from 'react';
import { EvmOperation } from 'src/dialog/evm/evm-operation/evm-operation';
import { EvmTransactionWarningsComponent } from 'src/dialog/evm/requests/transaction-warnings/transaction-warning.component';
import { useTransactionWarnings } from 'src/dialog/evm/requests/transaction-warnings/transaction-warning.hook';
import { EvmRequestMessage } from 'src/dialog/multichain/request/request-confirmation';

interface Props {
  request: EvmRequest;
  accounts: EvmAccount[];
  data: EvmRequestMessage;
}

export const GetEncryptionKey = (props: Props) => {
  const { accounts, data, request } = props;
  const warningHook = useTransactionWarnings(data);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    let transactionConfirmationFields = {
      otherFields: [],
    } as TransactionConfirmationFields;
    const transactionInfo =
      await EvmTransactionParserUtils.verifyTransactionInformation(
        data.dappInfo.domain,
      );
    transactionConfirmationFields.otherFields.push(
      await warningHook.getDomainWarnings(transactionInfo),
    );
    warningHook.setFields(transactionConfirmationFields);
  };

  const handleOnConfirm = async () => {
    if (warningHook.hasWarning()) {
      warningHook.setWarningsPopupOpened(true);
    } else {
      warningHook.setLoading(true);
      chrome.runtime.sendMessage({
        command: BackgroundCommand.ACCEPT_EVM_TRANSACTION,
        value: {
          request: request,
          tab: data.tab,
          domain: data.dappInfo.domain,
        },
      });
    }
  };

  return (
    <EvmOperation
      request={request}
      domain={data.dappInfo.domain}
      tab={data.tab}
      title={chrome.i18n.getMessage('dialog_evm_get_encryption_key_title')}
      fields={<EvmTransactionWarningsComponent warningHook={warningHook} />}
      caption={chrome.i18n.getMessage('dialog_evm_get_encryption_key', [
        data.dappInfo.domain,
      ])}
      onConfirm={handleOnConfirm}
      warningHook={warningHook}></EvmOperation>
  );
};
