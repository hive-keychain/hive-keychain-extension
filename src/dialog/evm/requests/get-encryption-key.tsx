import { EvmRequestMessage } from '@dialog/interfaces/messages.interface';
import { EvmRequest } from '@interfaces/evm-provider.interface';
import { TransactionConfirmationFields } from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { EvmTransactionParserUtils } from '@popup/evm/utils/evm-transaction-parser.utils';
import React, { useEffect } from 'react';
import { EvmOperation } from 'src/dialog/evm/evm-operation/evm-operation';
import { EvmTransactionWarningsComponent } from 'src/dialog/evm/requests/transaction-warnings/transaction-warning.component';
import { useTransactionHook } from 'src/dialog/evm/requests/transaction-warnings/transaction.hook';

interface Props {
  request: EvmRequest;
  accounts: EvmAccount[];
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
      otherFields: [],
    } as TransactionConfirmationFields;
    const transactionInfo =
      await EvmTransactionParserUtils.verifyTransactionInformation(
        data.dappInfo.domain,
      );

    const chain = await EvmChainUtils.getLastEvmChain();
    const usedAccount = accounts.find(
      (account) =>
        account.wallet.address.toLowerCase() ===
        request.params[0].toLowerCase(),
    );
    const usedAccountInput = await transactionHook.getWalletAddressInput(
      usedAccount!.wallet.address,
      chain.chainId,
      {} as any,
      accounts,
      'dialog_account',
    );
    transactionConfirmationFields.otherFields.push({
      ...usedAccountInput,
    });
    transactionConfirmationFields.otherFields.push(
      await transactionHook.getDomainWarnings(transactionInfo),
    );
    transactionHook.setUnableToReachBackend(
      !!(transactionInfo && transactionInfo.unableToReach),
    );

    transactionHook.setFields(transactionConfirmationFields);
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
      title={chrome.i18n.getMessage('dialog_evm_get_encryption_key_title')}
      fields={<EvmTransactionWarningsComponent warningHook={transactionHook} />}
      caption={chrome.i18n.getMessage('dialog_evm_get_encryption_key', [
        data.dappInfo.domain,
      ])}
      transactionHook={transactionHook}></EvmOperation>
  );
};
