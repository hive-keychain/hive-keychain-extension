import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/actions/message.actions';
import { Icons } from '@popup/icons.enum';
import { Proposal } from '@popup/pages/app-container/home/governance/proposal-tab/proposal-tab.component';
import { RootState } from '@popup/store';
import moment from 'moment';
import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import FormatUtils from 'src/utils/format.utils';
import ProposalUtils from 'src/utils/proposal.utils';
import './proposal-item.component.scss';

interface ProposalItemProps {
  proposal: Proposal;
  onVoteUnvoteSuccessful: () => void;
}

const ProposalItem = ({
  proposal,
  addToLoadingList,
  removeFromLoadingList,
  setErrorMessage,
  setSuccessMessage,
  activeAccount,
  onVoteUnvoteSuccessful,
}: PropsFromRedux) => {
  const [isExpandablePanelOpened, setExpandablePanelOpened] = useState(false);

  const goTo = (link: Proposal['link']) => {
    chrome.tabs.create({ url: link });
  };

  const goToCreator = (creator: Proposal['creator']) => {
    chrome.tabs.create({ url: `https://peakd.com/@${creator}` });
  };

  const toggleSupport = async (proposal: Proposal) => {
    if (proposal.voted) {
      addToLoadingList('popup_html_unvoting_for_proposal');
      if (
        await ProposalUtils.unvoteProposal(activeAccount, proposal.proposalId)
      ) {
        onVoteUnvoteSuccessful();
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
        onVoteUnvoteSuccessful();
      } else {
        setErrorMessage('popup_html_proposal_vote_successful');
      }
      removeFromLoadingList('popup_html_voting_for_proposal');
    }
  };

  return (
    <div
      className={`proposal-item`}
      key={proposal.proposalId}
      onClick={() => setExpandablePanelOpened(!isExpandablePanelOpened)}>
      <div className="title">
        <div>
          <span onClick={() => goTo(proposal.link)}>
            #{proposal.id} - {proposal.subject}
          </span>
        </div>
        <Icon
          name={Icons.EXPAND_MORE}
          onClick={() => setExpandablePanelOpened(!isExpandablePanelOpened)}
          additionalClassName={`more ${
            isExpandablePanelOpened ? 'opened' : 'closed'
          }`}
          type={IconType.OUTLINED}></Icon>
      </div>
      <div className="additional-info">
        <div className="left-panel">
          <div className="creator">
            <img
              onClick={() => goToCreator(proposal.creator)}
              src={`https://images.hive.blog/u/${proposal.creator}/avatar`}
              onError={(e: any) => {
                e.target.onError = null;
                e.target.src = '/assets/images/accounts.png';
              }}
            />
            <span onClick={() => goToCreator(proposal.creator)}>
              {chrome.i18n.getMessage('popup_html_proposal_by', [
                proposal.creator,
              ])}
            </span>
          </div>
        </div>
        <div className="nb-votes">
          <Icon
            onClick={() => toggleSupport(proposal)}
            additionalClassName={(proposal.voted ? 'voted' : 'not-voted') + ' '}
            name={Icons.ARROW_CIRCLE_UP}
            type={IconType.OUTLINED}
          />
        </div>
      </div>
      {isExpandablePanelOpened && (
        <div
          className={
            isExpandablePanelOpened
              ? 'expandable-panel opened'
              : 'expandable-panel closed'
          }>
          <div
            className="extra-info"
            data-for={`remaining-tooltip`}
            data-tip={`${proposal.startDate.format(
              'L',
            )} - ${proposal.endDate.format('L')}`}
            data-iscapture="true">
            <div className="value">
              <Icon name={Icons.ARROW_CIRCLE_UP} type={IconType.OUTLINED} />
              <div>{proposal.totalVotes}</div>
            </div>
            <div>
              <Icon name={Icons.TIMELAPSE} type={IconType.OUTLINED} />
              <div>
                {chrome.i18n.getMessage('popup_html_days_remaining', [
                  FormatUtils.withCommas(
                    proposal.endDate
                      .diff(moment(new Date()), 'days')
                      .toString(),
                    0,
                  ),
                ])}
              </div>
            </div>
            <div>
              <Icon name={Icons.ATTACH_MONEY} type={IconType.OUTLINED} />
              <div>
                {FormatUtils.withCommas(proposal.dailyPay)}/
                {chrome.i18n.getMessage('day')}
              </div>
            </div>
          </div>
          <div className={`funded-chip ${proposal.funded}`}>
            {chrome.i18n.getMessage(
              `popup_html_proposal_funded_option_${proposal.funded}`,
            )}
          </div>
          <ReactTooltip
            id={'remaining-tooltip'}
            place="top"
            type="light"
            effect="solid"
            multiline={true}
          />
        </div>
      )}
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
type PropsFromRedux = ConnectedProps<typeof connector> & ProposalItemProps;

export const ProposalItemComponent = connector(ProposalItem);
