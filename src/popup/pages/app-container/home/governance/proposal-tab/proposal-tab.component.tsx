import { Proposal } from '@interfaces/proposal.interface';
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
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import ProposalUtils from 'src/utils/proposal.utils';
import ProxyUtils from 'src/utils/proxy.utils';
import './proposal-tab.component.scss';

const ProposalTab = ({
  activeAccount,
  addToLoadingList,
  removeFromLoadingList,
}: PropsFromRedux) => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [displayingProxyVotes, setDisplayingProxyVotes] = useState(false);

  useEffect(() => {
    initList();
  }, []);

  const initList = async () => {
    setLoading(true);
    let proposals;
    let proxy = await ProxyUtils.findUserProxy(activeAccount.account);
    if (proxy) {
      setDisplayingProxyVotes(true);
    } else {
      setDisplayingProxyVotes(false);
    }
    proposals = await ProposalUtils.getProposalList(
      proxy ?? activeAccount.name!,
    );

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
    <div
      aria-label="proposal-tab"
      className={`proposal-tab ${isLoading ? 'loading' : ''}`}>
      {!isLoading && (
        <>
          {displayingProxyVotes && (
            <div className="using-proxy">
              {chrome.i18n.getMessage('html_popup_currently_using_proxy', [
                activeAccount.account.proxy,
              ])}
            </div>
          )}
          <div className="proposal-list">
            {proposals.map((proposal) => (
              <ProposalItemComponent
                key={proposal.proposalId}
                proposal={proposal}
                onVoteUnvoteSuccessful={() => toggleVoteInArray(proposal.id)}
              />
            ))}
          </div>
        </>
      )}
      {isLoading && (
        <div
          style={{
            height: '400px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
          <RotatingLogoComponent></RotatingLogoComponent>
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
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ProposalTabComponent = connector(ProposalTab);
