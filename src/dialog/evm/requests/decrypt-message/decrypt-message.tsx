import { EvmRequest } from '@interfaces/evm-provider.interface';
import { TransactionConfirmationFields } from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmRequestsUtils } from '@popup/evm/utils/evm-requests.utils';
import { EvmTransactionParserUtils } from '@popup/evm/utils/evm-transaction-parser.utils';
import { HDNodeWallet } from 'ethers';
import React, { useEffect, useState } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { EvmOperation } from 'src/dialog/evm/evm-operation/evm-operation';
import { EvmTransactionWarningsComponent } from 'src/dialog/evm/requests/transaction-warnings/transaction-warning.component';
import { useTransactionHook } from 'src/dialog/evm/requests/transaction-warnings/transaction.hook';
import { EvmRequestMessage } from 'src/dialog/multichain/request/request-confirmation';

interface Props {
  request: EvmRequest;
  accounts: EvmAccount[];
  data: EvmRequestMessage;
}

export const DecryptMessage = (props: Props) => {
  const { accounts, data, request } = props;
  const warningHook = useTransactionHook(data, request);

  const [decryptedMessage, setDecryptedMessage] = useState<
    string | undefined
  >();

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
    warningHook.setUnableToReachBackend(
      !!(transactionInfo && transactionInfo.unableToReach),
    );

    warningHook.setFields(transactionConfirmationFields);
  };

  const decryptMessage = () => {
    const account = accounts.find(
      (acc) =>
        acc.wallet.address.toLowerCase() === request.params[1].toLowerCase(),
    );
    account!.wallet = HDNodeWallet.fromPhrase(
      account!.wallet.mnemonic?.phrase!,
      undefined,
      account!.path,
    );
    setDecryptedMessage(
      EvmRequestsUtils.decryptMessage(account!, request.params[0]),
    );
  };

  return (
    <EvmOperation
      request={request}
      domain={data.dappInfo.domain}
      tab={data.tab}
      title={chrome.i18n.getMessage('dialog_evm_decrypt_message_title')}
      caption={chrome.i18n.getMessage('dialog_evm_decrypt_message_caption', [
        data.dappInfo.domain,
      ])}
      fields={<EvmTransactionWarningsComponent warningHook={warningHook} />}
      bottomPanel={
        <>
          <div
            className={`encrypted-message-container ${
              decryptedMessage ? 'display' : 'hidden'
            }`}
            onClick={decryptMessage}>
            <div className="encrypted-message">
              <div className="message">
                {decryptedMessage ?? request.params[0]}
              </div>
            </div>
            {!decryptedMessage && (
              <div className="display-message-icon" onClick={decryptMessage}>
                <SVGIcon icon={SVGIcons.EVM_SETUP_DISPLAY_MNEMONIC} />
                <div>
                  {chrome.i18n.getMessage('dialog_evm_decrypt_show_message')}
                </div>
              </div>
            )}
          </div>
        </>
      }
      transactionHook={warningHook}></EvmOperation>
  );
};
