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
import { EvmTransactionWarningsComponent } from 'src/dialog/evm/requests/transaction-warnings/transaction-warning.component';
import { useTransactionHook } from 'src/dialog/evm/requests/transaction-warnings/transaction.hook';
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
  const transactionHook = useTransactionHook(data, request);

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

    const lastChain = await EvmChainUtils.getLastEvmChain();

    const accountDisplay = await transactionHook.getWalletAddressInput(
      target,
      lastChain.chainId,
      transactionInfo,
    );

    transactionConfirmationFields.otherFields.push({
      type: EvmInputDisplayType.WALLET_ADDRESS,
      name: 'evm_account',
      value: accountDisplay.value,
    } as TransactionConfirmationField);
    transactionConfirmationFields.otherFields.push(
      await transactionHook.getDomainWarnings(transactionInfo),
    );
    transactionHook.setUnableToReachBackend(
      !!(transactionInfo && transactionInfo.unableToReach),
    );

    transactionHook.setFields(transactionConfirmationFields);
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
