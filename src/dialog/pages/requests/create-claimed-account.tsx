import {
  RequestCreateClaimedAccount,
  RequestId,
} from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React from 'react';
import { Separator } from 'src/common-ui/separator/separator.component';
import UsernameWithAvatar from 'src/common-ui/username-with-avatar/username-with-avatar';
import CollaspsibleItem from 'src/dialog/components/collapsible-item/collapsible-item';
import Operation from 'src/dialog/components/operation/operation';
import RequestItem from 'src/dialog/components/request-item/request-item';

type Props = {
  data: RequestCreateClaimedAccount & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
};

const CreateClaimedAccount = (props: Props) => {
  const { data } = props;
  const { owner, active, posting, memo } = data;
  const keys = {
    owner: JSON.parse(owner),
    active: JSON.parse(active),
    posting: JSON.parse(posting),
    memo,
  };
  return (
    <Operation
      title={chrome.i18n.getMessage('dialog_title_create_account')}
      {...props}>
      <UsernameWithAvatar title="dialog_account" username={data.username} />
      <Separator type={'horizontal'} fullSize />
      <RequestItem
        title="dialog_new_account"
        content={`@${data.new_account}`}
      />
      <Separator type={'horizontal'} fullSize />
      <CollaspsibleItem
        title="dialog_data"
        content={JSON.stringify(keys, undefined, 2)}
        pre
      />
    </Operation>
  );
};

export default CreateClaimedAccount;
