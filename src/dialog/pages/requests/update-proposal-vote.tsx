import {
  RequestId,
  RequestUpdateProposalVote,
} from '@interfaces/keychain.interface';
import React from 'react';
import Operation from 'src/dialog/components/operation/operation';
import RequestItem from 'src/dialog/components/request-item/request-item';

type Props = {
  data: RequestUpdateProposalVote & RequestId;
  domain: string;
  tab: number;
  testnet: boolean;
};

const UpdateProposalVote = (props: Props) => {
  const { data } = props;
  return (
    <Operation
      title={chrome.i18n.getMessage('dialog_title_vote_proposal')}
      {...props}>
      <RequestItem title="dialog_account" content={`@${data.username}`} />
      <RequestItem
        title="dialog_proposal_ids"
        content={JSON.parse(data.proposal_ids).join(', ')}
      />
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
