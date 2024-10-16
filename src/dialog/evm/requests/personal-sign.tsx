import { EvmRequest } from '@interfaces/evm-provider.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import React, { useState } from 'react';
import { DisplayText } from 'src/dialog/components/display-text/display-text';
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
  console.log(msg);
  const [target, setTarget] = useState<string>(request.params[1]);

  return (
    <EvmOperation
      data={request}
      domain={data.domain}
      tab={data.tab}
      title={chrome.i18n.getMessage('dialog_evm_sign_request')}
      caption={chrome.i18n.getMessage('dialog_signature_request_caption', [
        data.domain,
      ])}>
      <></>
      <DisplayText title="dialog_evm_sign_request_message" content={message} />
    </EvmOperation>
  );
};
