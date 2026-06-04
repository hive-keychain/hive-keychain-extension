import { EvmRequestMessage } from '@dialog/interfaces/messages.interface';
import { EvmRequest } from '@interfaces/evm-provider.interface';
import { TransactionConfirmationFields } from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmAccountPublic } from '@popup/evm/interfaces/wallet.interface';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { EvmTransactionParserUtils } from '@popup/evm/utils/evm-transaction-parser.utils';
import React, { useEffect } from 'react';
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

export const GetEncryptionKey = (props: Props) => {
  const { accounts, data, request, afterCancel } = props;
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

    const chain = await EvmChainUtils.getLastEvmChain();

    const transactionInfo =
      await EvmTransactionParserUtils.verifyTransactionInformation({
        domain: data.dappInfo.domain,
        origin: data.dappInfo.origin,
        chainId: chain.chainId,
      });
    transactionHook.setUnableToReachBackend(
      !!(transactionInfo && transactionInfo.unableToReach),
    );
    const usedAccount = accounts.find(
      (account) =>
        account.address.toLowerCase() ===
        request.params[0].toLowerCase(),
    );
    const usedAccountInput = await transactionHook.getWalletAddressInput(
      usedAccount!.address,
      chain.chainId,
      {} as any,
      accounts,
      'dialog_account',
    );
    transactionConfirmationFields.otherFields.push({
      ...usedAccountInput,
    });
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
      origin={data.dappInfo.origin}
      tab={data.tab}
      title={I18nUtils.getMessage('dialog_evm_get_encryption_key_title')}
      fields={<EvmTransactionWarningsComponent warningHook={transactionHook} />}
      caption={I18nUtils.getMessage('dialog_evm_get_encryption_key', [
        data.dappInfo.domain,
      ])}
      transactionHook={transactionHook}></EvmOperation>
  );
};
