import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/actions/message.actions';
import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import ReactTooltip from 'react-tooltip';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import ProposalUtils from 'src/utils/proposal.utils';
import './proposal-tab.component.scss';

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
}

const ProposalTab = ({
  activeAccount,
  addToLoadingList,
  removeFromLoadingList,
  setErrorMessage,
  setSuccessMessage,
}: PropsFromRedux) => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  useEffect(() => {
    initList();
  }, []);

  const initList = async () => {
    const proposals = await ProposalUtils.getProposalList(activeAccount);
    setProposals(proposals);
  };

  const goTo = (link: Proposal['link']) => {
    chrome.tabs.create({ url: link });
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

  const toggleSupport = async (proposal: Proposal) => {
    if (proposal.voted) {
      addToLoadingList('popup_html_unvoting_for_proposal');
      if (
        await ProposalUtils.unvoteProposal(activeAccount, proposal.proposalId)
      ) {
        toggleVoteInArray(proposal.id);
        setSuccessMessage('popup_html_proposal_unvote_successful');
      } else {
        setErrorMessage('popup_html_proposal_unvote_fail');
      }
      removeFromLoadingList('popup_html_unvoting_for_proposal');
    } else {
      addToLoadingList('popup_html_voting_for_proposal');
      if (
        await ProposalUtils.voteForProposal(activeAccount, proposal.proposalId)
      ) {
        setSuccessMessage('popup_html_proposal_vote_successful');
        toggleVoteInArray(proposal.id);
      } else {
        setErrorMessage('popup_html_proposal_vote_successful');
      }
      removeFromLoadingList('popup_html_voting_for_proposal');
    }
  };

  return (
    <div className="proposal-tab">
      <div className="proposal-list">
        {proposals.map((proposal) => (
          <div className="proposal-item" key={proposal.proposalId}>
            <div className="title" onClick={() => goTo(proposal.link)}>
              #{proposal.id} - {proposal.subject}
            </div>
            <div className="additional-info">
              <div className="left-panel">
                <div className="creator">
                  <img
                    src={`https://images.hive.blog/u/${proposal.creator}/avatar`}
                    onError={(e: any) => {
                      e.target.onError = null;
                      e.target.src = '/assets/images/accounts.png';
                    }}
                  />
                  <span>
                    {chrome.i18n.getMessage('popup_html_proposal_by', [
                      proposal.creator,
                    ])}
                  </span>
                </div>
                <div
                  className="remaining-days"
                  data-for={`remaining-tooltip`}
                  data-tip={`${proposal.startDate.format(
                    'L',
                  )} - ${proposal.endDate.format('L')}`}
                  data-iscapture="true">
                  {chrome.i18n.getMessage('popup_html_days_remaining', [
                    proposal.endDate
                      .diff(moment(new Date()), 'days')
                      .toString(),
                  ])}
                  <br />
                  {proposal.dailyPay}/{chrome.i18n.getMessage('day')}
                </div>
                <ReactTooltip
                  id={'remaining-tooltip'}
                  place="top"
                  type="light"
                  effect="solid"
                  multiline={true}
                />
              </div>
              <div className="nb-votes">
                <Icon
                  onClick={() => toggleSupport(proposal)}
                  additionalClassName={
                    (proposal.voted ? 'voted' : 'not-voted') + ' '
                  }
                  name={Icons.ARROW_CIRCLE_UP}
                  type={IconType.OUTLINED}
                />
                <span className="value">{proposal.totalVotes}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
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
