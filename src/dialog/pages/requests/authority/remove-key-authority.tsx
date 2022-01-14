import {
  RequestId,
  RequestRemoveKeyAuthority,
} from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React from 'react';
import Operation from 'src/dialog/components/operation/operation';
import RequestItem from 'src/dialog/components/request-item/request-item';

type Props = {
  data: RequestRemoveKeyAuthority & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
};

const RemoveKeyAuthority = (props: Props) => {
  const { data } = props;
  return (
    <Operation
      title={chrome.i18n.getMessage('dialog_title_remove_key_auth')}
      {...props}>
      <RequestItem title="dialog_account" content={`@${data.username}`} />
      <RequestItem title="dialog_auth_account" content={data.authorizedKey} />
      <RequestItem title="dialog_role" content={data.role} />
    </Operation>
  );
};

export default RemoveKeyAuthority;
