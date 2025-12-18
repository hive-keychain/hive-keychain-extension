import {
  RequestId,
  RequestRemoveKeyAuthority,
} from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React from 'react';
import { Separator } from 'src/common-ui/separator/separator.component';
import UsernameWithAvatar from 'src/common-ui/username-with-avatar/username-with-avatar';
import RequestItem from 'src/dialog/components/request-item/request-item';
import Operation from 'src/dialog/hive/operation/operation';

type Props = {
  data: RequestRemoveKeyAuthority & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
  afterCancel: (requestId: number, tab: number) => void;
};

const RemoveKeyAuthority = (props: Props) => {
  const { data } = props;
  return (
    <Operation
      title={chrome.i18n.getMessage('dialog_title_remove_key_auth')}
      {...props}>
      <UsernameWithAvatar title="dialog_account" username={data.username} />
      <Separator type={'horizontal'} fullSize />
      <RequestItem title="dialog_key" content={data.authorizedKey} />
      <Separator type={'horizontal'} fullSize />
      <RequestItem title="dialog_role" content={data.role} />
    </Operation>
  );
};

export default RemoveKeyAuthority;
