import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import Config from 'src/config';
import {
  setErrorMessage,
  setSuccessMessage,
} from 'src/popup/hive/actions/message.actions';
import ProposalUtils from 'src/popup/hive/utils/proposal.utils';
import FormatUtils from 'src/utils/format.utils';

const ProposalVotingSection = ({
  activeAccount,
  isMessageContainerDisplayed,
  globalProperties,
  setSuccessMessage,
  setErrorMessage,
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
    if (
      await ProposalUtils.isRequestingProposalVotes(globalProperties.globals!)
    ) {
      // Consider as already voted if it is, or if the account has a proxy or few HP
      const hasVoted =
        (await ProposalUtils.hasVotedForProposal(activeAccount.name!)) ||
        !!activeAccount.account.proxy.length ||
        FormatUtils.toHP(
          activeAccount.account.vesting_shares.toString(),
          globalProperties.globals,
        ) < 100;
      sethasVoted(hasVoted);
    }
  };

  const handleVoteForProposalClicked = async () => {
    const success = await ProposalUtils.voteForKeychainProposal(
      activeAccount.name!,
      activeAccount.keys.active!,
    );
    if (success) {
      if (success.isUsingMultisig) {
        setSuccessMessage('multisig_transaction_sent_to_signers');
      } else setSuccessMessage('popup_html_kc_proposal_vote_successful');
    } else {
      setErrorMessage('popup_html_proposal_vote_fail');
    }
    setForcedClosed(true);
  };

  const handleReadClicked = () => {
    chrome.tabs.create({
      url: `https://peakd.com/me/proposals/${Config.KEYCHAIN_PROPOSAL}`,
    });
  };

  const handleClose = (event: any) => {
    event.nativeEvent.stopImmediatePropagation();
    setForcedClosed(true);
  };
  return (
    <div
      data-testid="proposal-voting-section"
      className={`proposal-voting-section ${
        isMessageContainerDisplayed || hasVoted || forceClosed ? 'hide' : ''
      } ${isOpen ? 'opened' : 'closed'}`}
      onClick={() => setIsOpen(!isOpen)}>
      <SVGIcon
        className="close"
        onClick={handleClose}
        icon={SVGIcons.TOP_BAR_CLOSE_BTN}
      />
      <div className="text">
        {chrome.i18n.getMessage('popup_html_proposal_request')}
      </div>
      {isOpen && (
        <div className="button-panel">
          <ButtonComponent
            dataTestId="button-read-proposal"
            onClick={handleReadClicked}
            label={'html_popup_read'}
          />
          <OperationButtonComponent
            dataTestId="vote-key-chain-proposal"
            requiredKey={KeychainKeyTypesLC.active}
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
    activeAccount: state.hive.activeAccount,
    isMessageContainerDisplayed: state.errorMessage.key.length > 0,
    globalProperties: state.hive.globalProperties,
  };
};

const connector = connect(mapStateToProps, {
  setSuccessMessage,
  setErrorMessage,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ProposalVotingSectionComponent = connector(ProposalVotingSection);
