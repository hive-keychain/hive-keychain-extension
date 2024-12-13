import { EvmRequest } from '@interfaces/evm-provider.interface';
import { TransactionConfirmationFields } from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmTransactionParserUtils } from '@popup/evm/utils/evm-transaction-parser.utils';
import React, { useEffect, useState } from 'react';
import { Card } from 'src/common-ui/card/card.component';
import { DisplayText } from 'src/dialog/components/display-text/display-text';
import { EvmOperation } from 'src/dialog/evm/evm-operation/evm-operation';
import { useTransactionWarnings } from 'src/dialog/evm/requests/transaction-warnings/transaction-warning.hook';
import { EvmRequestMessage } from 'src/dialog/multichain/request/request-confirmation';

interface Props {
  request: EvmRequest;
  accounts: EvmAccount[];
  data: EvmRequestMessage;
}

export const PersonalSign = (props: Props) => {
  const { accounts, data, request } = props;
  const msg: string = Buffer.from(
    request.params[0].substring(2),
    'hex',
  ).toString('utf8');
  const [message, setMessage] = useState<string>(msg);
  const [target, setTarget] = useState<string>(request.params[1]);
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

  return (
    <EvmOperation
      request={request}
      domain={data.dappInfo.domain}
      tab={data.tab}
      title={chrome.i18n.getMessage('dialog_evm_sign_request')}
      caption={chrome.i18n.getMessage('dialog_signature_request_caption', [
        data.dappInfo.domain,
      ])}
      bottomPanel={
        <Card>
          <DisplayText
            title="dialog_evm_sign_request_message"
            content={message}
          />
        </Card>
      }
      warningHook={warningHook}></EvmOperation>
  );
};
