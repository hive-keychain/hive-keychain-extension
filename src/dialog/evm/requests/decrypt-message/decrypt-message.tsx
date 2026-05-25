import { EvmRequestMessage } from '@dialog/interfaces/messages.interface';
import { EvmRequest } from '@interfaces/evm-provider.interface';
import { TransactionConfirmationFields } from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmAccountPublic } from '@popup/evm/interfaces/wallet.interface';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { EvmTransactionParserUtils } from '@popup/evm/utils/evm-transaction-parser.utils';
import React, { useEffect, useState } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { EvmOperation } from 'src/dialog/evm/evm-operation/evm-operation';
import { reorderEvmConfirmationFields } from 'src/dialog/evm/requests/transaction-warnings/transaction-field-order.utils';
import { EvmTransactionWarningsComponent } from 'src/dialog/evm/requests/transaction-warnings/transaction-warning.component';
import { useTransactionHook } from 'src/dialog/evm/requests/transaction-warnings/transaction.hook';

interface Props {
  request: EvmRequest;
  accounts: EvmAccountPublic[];
  data: EvmRequestMessage;
  afterCancel: (requestId: number, tab: number) => void;
}

export const DecryptMessage = (props: Props) => {
  const { accounts, data, request, afterCancel } = props;
  const transactionHook = useTransactionHook(data, request);

  const [showEncryptedMessage, setShowEncryptedMessage] = useState(false);

  useEffect(() => {
    setShowEncryptedMessage(false);
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
        account.address.toLowerCase() === request.params[1].toLowerCase(),
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

  const showMessage = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    setShowEncryptedMessage(true);
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
      title={chrome.i18n.getMessage('dialog_evm_decrypt_message_title')}
      caption={chrome.i18n.getMessage('dialog_evm_decrypt_message_caption', [
        data.dappInfo.domain,
      ])}
      fields={<EvmTransactionWarningsComponent warningHook={transactionHook} />}
      bottomPanel={
        <>
          <div
            className={`encrypted-message-container ${
              showEncryptedMessage ? 'display' : 'hidden'
            }`}
            onClick={showMessage}>
            <div className="encrypted-message">
              <div className="message">{request.params[0]}</div>
            </div>
            {!showEncryptedMessage && (
              <div
                className="display-message-icon"
                onClick={showMessage}>
                <SVGIcon icon={SVGIcons.EVM_SETUP_DISPLAY_MNEMONIC} />
                <div>
                  {chrome.i18n.getMessage('dialog_evm_decrypt_show_message')}
                </div>
              </div>
            )}
          </div>
        </>
      }
      transactionHook={transactionHook}></EvmOperation>
  );
};
