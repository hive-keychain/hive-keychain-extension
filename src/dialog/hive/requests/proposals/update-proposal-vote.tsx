import { Separator } from '@common-ui/separator/separator.component';
import RequestItem from '@dialog/components/request-item/request-item';
import Operation from '@dialog/hive/operation/operation';
import { useAnonymousRequest } from '@dialog/hooks/anonymous-requests';
import {
  RequestId,
  RequestUpdateProposalVote,
} from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React from 'react';

type Props = {
  data: RequestUpdateProposalVote & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
  accounts?: string[];
};

const UpdateProposalVote = (props: Props) => {
  const { data, accounts } = props;
  const anonymousProps = useAnonymousRequest(data, accounts);
  const renderUsername = () => {
    return !accounts ? (
      <RequestItem title={'dialog_account'} content={`@${data.username}`} />
    ) : (
      <></>
    );
  };
  return (
    <Operation
      title={chrome.i18n.getMessage('dialog_title_vote_proposal')}
      {...props}
      {...anonymousProps}>
      {renderUsername()}
      <Separator type={'horizontal'} fullSize />
      <RequestItem
        title="dialog_proposal_ids"
        content={
          typeof data.proposal_ids === 'string'
            ? JSON.parse(data.proposal_ids).join(', ')
            : data.proposal_ids.join(', ')
        }
      />
      <Separator type={'horizontal'} fullSize />
      <RequestItem
        title="dialog_approve"
        content={
          data.approve
            ? chrome.i18n.getMessage('common_yes')
            : chrome.i18n.getMessage('common_no')
        }
      />
    </Operation>
  );
};

export default UpdateProposalVote;
