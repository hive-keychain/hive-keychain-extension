import { RequestId, RequestVote } from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React from 'react';
import { Separator } from 'src/common-ui/separator/separator.component';
import RequestItem from 'src/dialog/components/request-item/request-item';
import Operation from 'src/dialog/hive/operation/operation';

type Props = {
  data: RequestVote & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
};

const Vote = (props: Props) => {
  const { data } = props;
  return (
    <Operation
      title={chrome.i18n.getMessage('dialog_vote')}
      {...props}
      canWhitelist>
      <RequestItem title="dialog_account" content={`@${data.username}`} />
      <Separator type={'horizontal'} fullSize />
      <RequestItem title="dialog_author" content={`@${data.author}`} />
      <Separator type={'horizontal'} fullSize />
      <RequestItem title="dialog_permlink" content={data.permlink} />
      <Separator type={'horizontal'} fullSize />
      <RequestItem title="dialog_weight" content={`${+data.weight / 100}%`} />
    </Operation>
  );
};

export default Vote;
