import { PrivateKeyType } from '@interfaces/keys.interface';
import { Proposal } from '@interfaces/proposal.interface';
import { KeysUtils } from '@popup/hive/utils/keys.utils';
import {
  addCaptionToLoading,
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/multichain/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/multichain/actions/message.actions';
import { RootState } from '@popup/multichain/store';
import { KeychainKeyTypesLC } from 'hive-keychain-commons';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import ProposalUtils from 'src/popup/hive/utils/proposal.utils';
import ProxyUtils from 'src/popup/hive/utils/proxy.utils';
import FormatUtils from 'src/utils/format.utils';

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
  addCaptionToLoading,
}: PropsFromRedux) => {
  const [isExpandablePanelOpened, setExpandablePanelOpened] = useState(false);
  const [usingProxy, setUsingProxy] = useState(false);
  const [keyType, setKeyType] = useState<PrivateKeyType>();

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (activeAccount) {
      setKeyType(
        KeysUtils.getKeyType(
          activeAccount.keys.active!,
          activeAccount.keys.activePubkey!,
          activeAccount.account,
          activeAccount.account,
          KeychainKeyTypesLC.active,
        ),
      );
    }
  }, [activeAccount]);

  const init = async () => {
    let proxy = await ProxyUtils.findUserProxy(activeAccount.account);
    setUsingProxy(proxy !== null);
  };

  const goTo = (link: Proposal['link']) => {
    chrome.tabs.create({ url: link });
  };

  const goToCreator = (creator: Proposal['creator']) => {
    chrome.tabs.create({ url: `https://peakd.com/@${creator}` });
  };

  const toggleSupport = async (proposal: Proposal) => {
    if (usingProxy) {
      return;
    }

    if (keyType === PrivateKeyType.MULTISIG) {
      addCaptionToLoading('multisig_transmitting_to_multisig');
    }

    if (proposal.voted) {
      addToLoadingList('popup_html_unvoting_for_proposal');
      const success = await ProposalUtils.unvoteProposal(
        proposal.proposalId,
        activeAccount.name!,
        activeAccount.keys.active!,
      );
      if (success) {
        if (success.isUsingMultisig) {
          setSuccessMessage('multisig_transaction_sent_to_signers');
        } else {
          onVoteUnvoteSuccessful();
          setSuccessMessage('popup_html_proposal_unvote_successful');
        }
      } else {
        setErrorMessage('popup_html_proposal_unvote_fail');
      }
      removeFromLoadingList('popup_html_unvoting_for_proposal');
    } else {
      addToLoadingList('popup_html_voting_for_proposal');
      const success = await ProposalUtils.voteForProposal(
        proposal.proposalId,
        activeAccount.name!,
        activeAccount.keys.active!,
      );
      if (success) {
        if (success.isUsingMultisig) {
          setSuccessMessage('multisig_transaction_sent_to_signers');
        } else {
          setSuccessMessage('popup_html_proposal_vote_successful');
          onVoteUnvoteSuccessful();
        }
      } else {
        setErrorMessage('popup_html_proposal_vote_fail');
      }
      removeFromLoadingList('popup_html_voting_for_proposal');
    }
  };

  return (
    <div
      data-testid={`proposal-item-expandable`}
      className={`proposal-item`}
      key={proposal.proposalId}>
      <div className="title">
        <div>
          <span
            data-testid={`proposal-item-span-go-to-link-${proposal.creator}`}
            onClick={() => goTo(proposal.link)}>
            #{proposal.id} - {proposal.subject}
          </span>
        </div>
        <SVGIcon
          dataTestId={`proposal-item-icon-expandable-${proposal.creator}`}
          className={`more ${isExpandablePanelOpened ? 'open' : 'closed'}`}
          icon={SVGIcons.GOVERNANCE_PROPOSAL_EXPAND_COLLAPSE}
          onClick={() => setExpandablePanelOpened(!isExpandablePanelOpened)}
        />
      </div>
      <div className="additional-info">
        <div className="left-panel">
          <div className="creator">
            <img
              data-testid={`proposal-item-image-go-to-creator-${proposal.creator}`}
              onClick={() => goToCreator(proposal.creator)}
              src={`https://images.hive.blog/u/${proposal.creator}/avatar`}
              onError={(e: any) => {
                e.target.onError = null;
                e.target.src = '/assets/images/accounts.png';
              }}
            />
            <span
              data-testid={`proposal-item-span-go-to-creator-${proposal.creator}`}
              onClick={() => goToCreator(proposal.creator)}>
              {chrome.i18n.getMessage('popup_html_proposal_by', [
                proposal.creator,
              ])}
            </span>
          </div>
        </div>
        <div className="upvote-button">
          <SVGIcon
            dataTestId={`proposal-item-icon-vote-unvote-${proposal.creator}`}
            onClick={() => toggleSupport(proposal)}
            className={
              (proposal.voted ? 'voted' : 'not-voted') +
              ' ' +
              (usingProxy || !activeAccount.keys.active ? 'using-proxy' : '')
            }
            icon={SVGIcons.GOVERNANCE_PROPOSAL_UPVOTE}
            tooltipPosition="left"
            tooltipMessage={
              !activeAccount.keys.active
                ? 'popup_missing_key_proposal'
                : usingProxy
                ? 'html_popup_proposal_vote_error_proxy'
                : undefined
            }
          />
        </div>
      </div>
      {isExpandablePanelOpened && (
        <div
          data-testid={`proposal-item-panel-expandable-${proposal.creator}`}
          className={
            isExpandablePanelOpened
              ? 'expandable-panel opened'
              : 'expandable-panel closed'
          }>
          <CustomTooltip
            message={`${proposal.startDate.format(
              'L',
            )} ${proposal.endDate.format('L')}`}
            skipTranslation>
            <div className="extra-info">
              <div className="value">
                <SVGIcon icon={SVGIcons.GOVERNANCE_PROPOSAL_UPVOTE_VALUE} />
                <div data-testid="proposal-item-extra-info-value">
                  {proposal.totalVotes}
                </div>
              </div>
              <div>
                <SVGIcon icon={SVGIcons.GOVERNANCE_PROPOSAL_DURATION} />
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
                <SVGIcon icon={SVGIcons.GOVERNANCE_PROPOSAL_BUDGET} />
                <div>
                  {FormatUtils.withCommas(proposal.dailyPay.toString())}/
                  {chrome.i18n.getMessage('day')}
                </div>
              </div>
            </div>
          </CustomTooltip>
          <div
            data-testid={`proposal-item-extra-info-funded-${proposal.creator}`}
            className={`funded-chip ${proposal.funded}`}>
            {chrome.i18n.getMessage(
              `popup_html_proposal_funded_option_${proposal.funded}`,
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return { activeAccount: state.hive.activeAccount };
};

const connector = connect(mapStateToProps, {
  addToLoadingList,
  removeFromLoadingList,
  setErrorMessage,
  setSuccessMessage,
  addCaptionToLoading,
});
type PropsFromRedux = ConnectedProps<typeof connector> & ProposalItemProps;

export const ProposalItemComponent = connector(ProposalItem);
