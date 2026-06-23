import { EvmRequestMessage } from '@dialog/interfaces/messages.interface';
import { EvmRequest } from '@interfaces/evm-provider.interface';
import {
  TransactionConfirmationField,
  TransactionConfirmationFields,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmAccountPublic } from '@popup/evm/interfaces/wallet.interface';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import {
  EvmInputDisplayType,
  EvmTransactionParserUtils,
} from '@popup/evm/utils/evm-transaction-parser.utils';
import React, { useEffect } from 'react';
import { Card } from 'src/common-ui/card/card.component';
import { DisplayText } from 'src/dialog/components/display-text/display-text';
import { EvmLedgerDialogUtils } from 'src/dialog/evm/evm-ledger-dialog.utils';
import { EvmOperation } from 'src/dialog/evm/evm-operation/evm-operation';
import { reorderEvmConfirmationFields } from 'src/dialog/evm/requests/transaction-warnings/transaction-field-order.utils';
import { EvmTransactionWarningsComponent } from 'src/dialog/evm/requests/transaction-warnings/transaction-warning.component';
import { useTransactionHook } from 'src/dialog/evm/requests/transaction-warnings/transaction.hook';

import { I18nUtils } from 'src/utils/i18n.utils';
interface Props {
  request: EvmRequest;
  accounts: EvmAccountPublic[];
  data: EvmRequestMessage;
  afterCancel: (requestId: number, tab: number) => void;
}

export const PersonalSign = (props: Props) => {
  const { accounts, data, request, afterCancel } = props;
  let msg: string;
  if (request.params[0].startsWith('0x')) {
    msg = Buffer.from(request.params[0].substring(2), 'hex').toString('utf8');
  } else {
    msg = request.params[0];
  }
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

    const lastChain = await EvmChainUtils.getLastEvmChain();

    const transactionInfo =
      await EvmTransactionParserUtils.verifyTransactionInformation({
        domain: data.dappInfo.domain,
        origin: data.dappInfo.origin,
        chainId: lastChain.chainId,
      });
    transactionHook.setUnableToReachBackend(
      !!(transactionInfo && transactionInfo.unableToReach),
    );

    const accountDisplay = await transactionHook.getWalletAddressInput(
      msg,
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
  const loadingCaption =
    EvmLedgerDialogUtils.getLedgerConfirmationCaptionForAddress(
      accounts,
      props.request.params[1],
    );

  return (
    <EvmOperation
      afterCancel={handleCancel}
      request={request}
      domain={data.dappInfo.domain}
      origin={data.dappInfo.origin}
      tab={data.tab}
      title={I18nUtils.getMessage('dialog_evm_sign_request')}
      caption={I18nUtils.getMessage('dialog_signature_request_caption', [
        data.dappInfo.domain,
      ])}
      fields={<EvmTransactionWarningsComponent warningHook={transactionHook} />}
      bottomPanel={
        <Card>
          <DisplayText title="dialog_evm_sign_request_message" content={msg} />
        </Card>
      }
      loadingCaption={loadingCaption}
      transactionHook={transactionHook}></EvmOperation>
  );
};
