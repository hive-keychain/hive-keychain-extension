import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import ProposalUtils from 'src/utils/proposal.utils';
import './proposal-voting-section.component.scss';

const ProposalVotingSection = ({
  activeAccount,
  isMessageContainerDisplayed,
}: PropsFromRedux) => {
  const [hasVoted, sethasVoted] = useState(true);
  const [forceClosed, setForcedClosed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (activeAccount.name) {
      initHasVotedForProposal();
    }
  }, [activeAccount]);

  const initHasVotedForProposal = async () => {
    sethasVoted(await ProposalUtils.hasVotedForProposal(activeAccount));
  };

  const handleVoteForProposalClicked = async () => {
    const res = await ProposalUtils.voteForProposal(activeAccount);
    console.log(res);
  };

  const handleReadClicked = () => {
    chrome.tabs.create({
      url: 'https://peakd.com/me/proposals/174',
    });
  };

  const handleClose = (event: any) => {
    console.log(event);
    event.nativeEvent.stopImmediatePropagation();
    setForcedClosed(true);
  };

  return (
    <div
      className={`proposal-voting-section ${
        isMessageContainerDisplayed || hasVoted || forceClosed ? 'hide' : ''
      } ${isOpen ? 'opened' : 'closed'}`}
      onClick={() => setIsOpen(true)}>
      <span className="material-icons close" onClick={handleClose}>
        {Icons.CLOSE}
      </span>
      <div className="text">
        {chrome.i18n.getMessage('popup_html_proposal_request')}
      </div>
      {isOpen && (
        <div className="button-panel">
          <ButtonComponent
            onClick={handleReadClicked}
            label={'html_popup_read'}
          />
          <ButtonComponent
            onClick={handleVoteForProposalClicked}
            label={'html_popup_vote'}
          />
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    isMessageContainerDisplayed: state.errorMessage.key.length > 0,
  };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ProposalVotingSectionComponent = connector(ProposalVotingSection);
