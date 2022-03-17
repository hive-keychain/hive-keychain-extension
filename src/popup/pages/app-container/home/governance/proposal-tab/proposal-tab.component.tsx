import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/actions/message.actions';
import { ProposalItemComponent } from '@popup/pages/app-container/home/governance/proposal-tab/proposal-item/proposal-item.component';
import { RootState } from '@popup/store';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import ProposalUtils from 'src/utils/proposal.utils';
import './proposal-tab.component.scss';

export enum FundedOption {
  TOTALLY_FUNDED = 'totally_funded',
  PARTIALLY_FUNDED = 'partially_funded',
  NOT_FUNDED = 'not_funded',
}
export interface Proposal {
  id: number;
  creator: string;
  dailyPay: string;
  startDate: moment.Moment;
  endDate: moment.Moment;
  receiver: string;
  status: string;
  totalVotes: string;
  subject: string;
  link: string;
  proposalId: number;
  voted: boolean;
  funded: FundedOption;
}

const ProposalTab = ({
  activeAccount,
  addToLoadingList,
  removeFromLoadingList,
}: PropsFromRedux) => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    initList();
  }, []);

  const initList = async () => {
    setLoading(true);
    const proposals = await ProposalUtils.getProposalList(activeAccount);
    setProposals(proposals);
    setLoading(false);
  };

  const toggleVoteInArray = (id: number) => {
    const proposalsCopy = [...proposals];
    for (let proposal of proposalsCopy) {
      if (proposal.proposalId === id) {
        proposal.voted = !proposal.voted;
        break;
      }
    }
    setProposals(proposalsCopy);
  };

  return (
    <div className={`proposal-tab ${isLoading ? 'loading' : ''}`}>
      {!isLoading && (
        <div className="proposal-list">
          {proposals.map((proposal) => (
            <ProposalItemComponent
              key={proposal.proposalId}
              proposal={proposal}
              onVoteUnvoteSuccessful={() => toggleVoteInArray(proposal.id)}
            />
          ))}
        </div>
      )}
      {isLoading && <RotatingLogoComponent></RotatingLogoComponent>}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return { activeAccount: state.activeAccount };
};

const connector = connect(mapStateToProps, {
  addToLoadingList,
  removeFromLoadingList,
  setErrorMessage,
  setSuccessMessage,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ProposalTabComponent = connector(ProposalTab);
