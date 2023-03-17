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
import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import { FavoriteAccounts } from 'src/utils/favorite-user.utils';
import './favorite-accounts-item.component.scss';

interface ProposalItemProps {
  //TODO change name & props as needed
  favorite: FavoriteAccounts;
  //   onVoteUnvoteSuccessful: () => void;
  deleteFavorite: (category: string, favoriteItem: FavoriteAccounts) => void;
}

const FavoriteAccountsItem = ({
  favorite,
  addToLoadingList,
  removeFromLoadingList,
  setErrorMessage,
  setSuccessMessage,
  activeAccount,
  deleteFavorite,
}: //   onVoteUnvoteSuccessful,
PropsFromRedux) => {
  const [isExpandablePanelOpened, setExpandablePanelOpened] = useState(false);
  const [usingProxy, setUsingProxy] = useState(false);

  //   useEffect(() => {
  //     init();
  //   }, []);

  //   const init = async () => {
  //     let proxy = await ProxyUtils.findUserProxy(activeAccount.account);
  //     setUsingProxy(proxy !== null);
  //   };

  //   const goTo = (link: Proposal['link']) => {
  //     chrome.tabs.create({ url: link });
  //   };

  //   const goToCreator = (creator: Proposal['creator']) => {
  //     chrome.tabs.create({ url: `https://peakd.com/@${creator}` });
  //   };

  //   const toggleSupport = async (proposal: Proposal) => {
  //     if (proposal.voted) {
  //       addToLoadingList('popup_html_unvoting_for_proposal');
  //       if (
  //         await ProposalUtils.unvoteProposal(
  //           proposal.proposalId,
  //           activeAccount.name!,
  //           activeAccount.keys.active!,
  //         )
  //       ) {
  //         onVoteUnvoteSuccessful();
  //         setSuccessMessage('popup_html_proposal_unvote_successful');
  //       } else {
  //         setErrorMessage('popup_html_proposal_unvote_fail');
  //       }
  //       removeFromLoadingList('popup_html_unvoting_for_proposal');
  //     } else {
  //       addToLoadingList('popup_html_voting_for_proposal');
  //       if (
  //         await ProposalUtils.voteForProposal(
  //           proposal.proposalId,
  //           activeAccount.name!,
  //           activeAccount.keys.active!,
  //         )
  //       ) {
  //         setSuccessMessage('popup_html_proposal_vote_successful');
  //         onVoteUnvoteSuccessful();
  //       } else {
  //         setErrorMessage('popup_html_proposal_vote_fail');
  //       }
  //       removeFromLoadingList('popup_html_voting_for_proposal');
  //     }
  //   };

  return (
    <div className="favorite-accounts-item" key={favorite.account}>
      <div className="item">
        <span>
          {favorite.account}{' '}
          {favorite.subLabel ? `(${favorite.subLabel})` : `(${favorite.label})`}
        </span>
        <Icon
          onClick={() => deleteFavorite('favorite_users', favorite)}
          name={Icons.DELETE}
          type={IconType.OUTLINED}
          additionalClassName="remove-button"
        />
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
type PropsFromRedux = ConnectedProps<typeof connector> & ProposalItemProps;

export const FavoriteAccountsItemComponent = connector(FavoriteAccountsItem);
