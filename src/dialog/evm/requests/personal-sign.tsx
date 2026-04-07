import { EvmRequestMessage } from '@dialog/interfaces/messages.interface';
import { EvmRequest } from '@interfaces/evm-provider.interface';
import {
  TransactionConfirmationField,
  TransactionConfirmationFields,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import {
  EvmInputDisplayType,
  EvmTransactionParserUtils,
} from '@popup/evm/utils/evm-transaction-parser.utils';
import React, { useEffect, useState } from 'react';
import { Card } from 'src/common-ui/card/card.component';
import { DisplayText } from 'src/dialog/components/display-text/display-text';
import { EvmOperation } from 'src/dialog/evm/evm-operation/evm-operation';
import { reorderEvmConfirmationFields } from 'src/dialog/evm/requests/transaction-warnings/transaction-field-order.utils';
import { EvmTransactionWarningsComponent } from 'src/dialog/evm/requests/transaction-warnings/transaction-warning.component';
import { useTransactionHook } from 'src/dialog/evm/requests/transaction-warnings/transaction.hook';

interface Props {
  request: EvmRequest;
  accounts: EvmAccount[];
  data: EvmRequestMessage;
  afterCancel: (requestId: number, tab: number) => void;
}

export const PersonalSign = (props: Props) => {
  const { accounts, data, request, afterCancel } = props;
  const msg: string = Buffer.from(
    request.params[0].substring(2),
    'hex',
  ).toString('utf8');
  const [message, setMessage] = useState<string>(msg);
  const [target, setTarget] = useState<string>(request.params[1]);
  const transactionHook = useTransactionHook(data, request);

  useEffect(() => {
    init();
  }, [request]);

  const init = async () => {
    transactionHook.setLoading(true);
    transactionHook.setReady(false);
    let transactionConfirmationFields = {
      otherFields: [transactionHook.buildInitialDomainField()],
    } as TransactionConfirmationFields;
    transactionConfirmationFields.otherFields = reorderEvmConfirmationFields(
      transactionConfirmationFields.otherFields,
    );
    transactionHook.setFields(transactionConfirmationFields);

    const transactionInfo =
      await EvmTransactionParserUtils.verifyTransactionInformation(
        data.dappInfo.domain,
      );
    transactionHook.setUnableToReachBackend(
      !!(transactionInfo && transactionInfo.unableToReach),
    );

    const lastChain = await EvmChainUtils.getLastEvmChain();

    const accountDisplay = await transactionHook.getWalletAddressInput(
      target,
      lastChain.chainId,
      transactionInfo,
      accounts,
    );

    transactionConfirmationFields.otherFields.push({
      type: EvmInputDisplayType.WALLET_ADDRESS,
      name: 'dialog_account',
      value: accountDisplay.value,
    } as TransactionConfirmationField);
    transactionConfirmationFields.otherFields = reorderEvmConfirmationFields(
      transactionConfirmationFields.otherFields,
    );
    transactionHook.setFields(transactionConfirmationFields);
    void transactionHook.hydrateDomainFieldWarnings(transactionInfo);
    setTimeout(() => {
      transactionHook.setReady(true);
      transactionHook.setLoading(false);
    }, 250);
  };

  const handleCancel = () => {
    afterCancel(request.request_id, data.tab);
  };

  return (
    <EvmOperation
      afterCancel={handleCancel}
      request={request}
      domain={data.dappInfo.domain}
      tab={data.tab}
      title={chrome.i18n.getMessage('dialog_evm_sign_request')}
      caption={chrome.i18n.getMessage('dialog_signature_request_caption', [
        data.dappInfo.domain,
      ])}
      fields={<EvmTransactionWarningsComponent warningHook={transactionHook} />}
      bottomPanel={
        <Card>
          <DisplayText
            title="dialog_evm_sign_request_message"
            content={message}
          />
        </Card>
      }
      transactionHook={transactionHook}></EvmOperation>
  );
};
