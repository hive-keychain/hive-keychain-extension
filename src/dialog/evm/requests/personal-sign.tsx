import { EvmRequest } from '@interfaces/evm-provider.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import React, { useState } from 'react';
import { DialogCaption } from 'src/dialog/components/dialog-caption/dialog-caption.component';
import RequestItem from 'src/dialog/components/request-item/request-item';
import { EvmOperation } from 'src/dialog/evm/evm-operation/evm-operation';
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

  return (
    <EvmOperation
      data={request}
      domain={data.domain}
      tab={0}
      title={chrome.i18n.getMessage('dialog_evm_sign_request')}>
      <DialogCaption
        text={chrome.i18n.getMessage('dialog_signature_request_caption', [
          data.domain,
        ])}
      />
      <RequestItem
        title="dialog_evm_sign_request_message"
        content={`${message}`}
      />
    </EvmOperation>
  );
};
