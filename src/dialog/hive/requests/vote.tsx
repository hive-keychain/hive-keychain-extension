import { RequestId, RequestVote } from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React from 'react';
import { Separator } from 'src/common-ui/separator/separator.component';
import UsernameWithAvatar from 'src/common-ui/username-with-avatar/username-with-avatar';
import RequestItem from 'src/dialog/components/request-item/request-item';
import Operation from 'src/dialog/hive/operation/operation';

type Props = {
  data: RequestVote & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
  afterCancel: (requestId: number, tab: number) => void;
};

const Vote = (props: Props) => {
  const { data } = props;
  return (
    <Operation
      title={chrome.i18n.getMessage('dialog_vote')}
      {...props}
      canWhitelist>
      <UsernameWithAvatar title="dialog_account" username={data.username} />
      <Separator type={'horizontal'} fullSize />
      <UsernameWithAvatar title="dialog_author" username={data.author} />
      <Separator type={'horizontal'} fullSize />
      <RequestItem title="dialog_permlink" content={data.permlink} />
      <Separator type={'horizontal'} fullSize />
      <RequestItem title="dialog_weight" content={`${+data.weight / 100}%`} />
    </Operation>
  );
};

export default Vote;
