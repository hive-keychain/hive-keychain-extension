import {
  RequestId,
  RequestRemoveProposal,
} from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React from 'react';
import { Separator } from 'src/common-ui/separator/separator.component';
import RequestItem from 'src/dialog/components/request-item/request-item';
import Operation from 'src/dialog/hive/operation/operation';

type Props = {
  data: RequestRemoveProposal & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
};

const RemoveProposal = (props: Props) => {
  const { data } = props;

  return (
    <Operation
      title={chrome.i18n.getMessage('dialog_title_remove_proposal')}
      {...props}>
      <RequestItem title="dialog_account" content={`@${data.username}`} />
      <Separator type={'horizontal'} fullSize />
      <RequestItem
        title="dialog_proposal_ids"
        content={
          typeof data.proposal_ids === 'string'
            ? JSON.parse(data.proposal_ids).join(', ')
            : data.proposal_ids.join(', ')
        }
      />
    </Operation>
  );
};

export default RemoveProposal;
