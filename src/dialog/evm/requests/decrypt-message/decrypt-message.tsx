import { EvmRequest } from '@interfaces/evm-provider.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmRequestsUtils } from '@popup/evm/utils/evm-requests.utils';
import { HDNodeWallet } from 'ethers';
import React, { useState } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { EvmOperation } from 'src/dialog/evm/evm-operation/evm-operation';
import { useTransactionWarnings } from 'src/dialog/evm/requests/transaction-warnings/transaction-warning.hook';
import { EvmRequestMessage } from 'src/dialog/multichain/request/request-confirmation';

interface Props {
  request: EvmRequest;
  accounts: EvmAccount[];
  data: EvmRequestMessage;
}

export const DecryptMessage = (props: Props) => {
  const { accounts, data, request } = props;
  const warningHook = useTransactionWarnings(data);

  const [decryptedMessage, setDecryptedMessage] = useState<
    string | undefined
  >();

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
      warningHook={warningHook}></EvmOperation>
  );
};
