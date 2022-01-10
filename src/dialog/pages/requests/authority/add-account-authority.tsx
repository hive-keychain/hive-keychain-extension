import {
  RequestAddAccountAuthority,
  RequestId,
} from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React from 'react';
import Operation from 'src/dialog/components/operation/operation';
import RequestItem from 'src/dialog/components/request-item/request-item';

type Props = {
  data: RequestAddAccountAuthority & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
};

const AddAccountAuthority = (props: Props) => {
  const { data } = props;
  return (
    <Operation
      title={chrome.i18n.getMessage('dialog_title_add_auth')}
      {...props}>
      <RequestItem title="dialog_account" content={`@${data.username}`} />
      <RequestItem
        title="dialog_auth_account"
        content={`@${data.authorizedUsername}`}
      />
      <RequestItem title="dialog_role" content={data.role} />
      <RequestItem title="dialog_weight" content={data.weight + ''} />
    </Operation>
  );
};

export default AddAccountAuthority;
