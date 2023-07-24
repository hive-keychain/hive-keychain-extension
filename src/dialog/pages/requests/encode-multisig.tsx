import {
  KeychainKeyTypesLC,
  RequestEncodeMultisig,
  RequestId,
} from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React from 'react';
import Operation from 'src/dialog/components/operation/operation';
import RequestItem, {
  RequestItemType,
} from 'src/dialog/components/request-item/request-item';

type Props = {
  data: RequestEncodeMultisig & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
};

const EncodeMultisig = (props: Props) => {
  const { data } = props;
  return (
    <Operation
      title={chrome.i18n.getMessage('dialog_title_encode_multisig')}
      {...props}
      canWhitelist={data.method.toLowerCase() !== KeychainKeyTypesLC.active}>
      <RequestItem title="dialog_account" content={`@${data.username}`} />
      <RequestItem
        title="dialog_public_keys"
        content={data.publicKeys}
        type={RequestItemType.LIST}
      />
      <RequestItem title="dialog_key" content={data.method} />
      <RequestItem title="dialog_message" content={data.message} />
    </Operation>
  );
};

export default EncodeMultisig;
