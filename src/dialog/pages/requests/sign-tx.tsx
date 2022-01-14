import {
  KeychainKeyTypesLC,
  RequestId,
  RequestSignTx,
} from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React from 'react';
import CollaspsibleItem from 'src/dialog/components/collapsible-item/collapsible-item';
import Operation from 'src/dialog/components/operation/operation';
import RequestItem from 'src/dialog/components/request-item/request-item';

type Props = {
  data: RequestSignTx & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
};

const SignTx = (props: Props) => {
  const { data } = props;

  return (
    <Operation
      title={chrome.i18n.getMessage('dialog_title_sign_tx')}
      {...props}
      canWhitelist={data.method.toLowerCase() !== KeychainKeyTypesLC.active}>
      <RequestItem title="dialog_account" content={`@${data.username}`} />
      <RequestItem title="dialog_key" content={data.method} />
      <CollaspsibleItem
        title="dialog_tx"
        content={JSON.stringify(data.tx, undefined, 2)}
        pre
      />
    </Operation>
  );
};

export default SignTx;
