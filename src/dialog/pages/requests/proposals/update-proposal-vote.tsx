import {
  RequestId,
  RequestUpdateProposalVote,
} from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React from 'react';
import { Separator } from 'src/common-ui/separator/separator.component';
import UsernameWithAvatar from 'src/common-ui/username-with-avatar/username-with-avatar';
import Operation from 'src/dialog/components/operation/operation';
import RequestItem from 'src/dialog/components/request-item/request-item';
import { useAnonymousRequest } from 'src/dialog/hooks/anonymous-requests';

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
    return !accounts && data.username ? (
      <UsernameWithAvatar title={'dialog_account'} username={data.username} />
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
