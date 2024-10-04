import { EvmRequest } from '@interfaces/evm-provider.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import React from 'react';
import { DialogCaption } from 'src/dialog/components/dialog-caption/dialog-caption.component';
import { EvmOperation } from 'src/dialog/evm/evm-operation/evm-operation';
import { EvmRequestMessage } from 'src/dialog/multichain/request/request-confirmation';

interface Props {
  request: EvmRequest;
  accounts: EvmAccount[];
  data: EvmRequestMessage;
}

export const GetEncryptionKey = (props: Props) => {
  const { accounts, data, request } = props;

  return (
    <EvmOperation
      data={request}
      domain={data.domain}
      tab={data.tab}
      title={chrome.i18n.getMessage('dialog_evm_sign_request')}>
      <DialogCaption
        text={chrome.i18n.getMessage('dialog_evm_get_encryption_key', [
          data.domain,
        ])}
      />
      <></>
    </EvmOperation>
  );
};
