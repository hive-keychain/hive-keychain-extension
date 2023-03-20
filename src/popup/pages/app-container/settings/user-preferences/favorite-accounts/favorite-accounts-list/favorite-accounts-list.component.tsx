import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/actions/message.actions';
import { FavoriteAccountsItemComponent } from '@popup/pages/app-container/settings/user-preferences/favorite-accounts/favorite-accounts-item/favorite-accounts-item.component';
import { RootState } from '@popup/store';
import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
  FavoriteAccounts,
  FavoriteUserList,
  FavoriteUserListName,
} from 'src/utils/favorite-user.utils';
import './favorite-accounts-list.component.scss'; //TODO fill what you may need

interface ProposalItemProps {
  //TODO change name & props as needed
  favoriteList: FavoriteUserList;
  //   onVoteUnvoteSuccessful: () => void;
  //TODO add a common props?
  handleDeleteFavorite: (
    listName: FavoriteUserListName,
    favoriteItem: FavoriteAccounts,
  ) => void;
  handleEditFavoriteLabel: (
    listName: FavoriteUserListName,
    favoriteItem: FavoriteAccounts,
    newLabel: string,
  ) => void;
}

const FavoriteAccountsList = ({
  favoriteList,
  // category,
  addToLoadingList,
  removeFromLoadingList,
  setErrorMessage,
  setSuccessMessage,
  activeAccount,
  handleDeleteFavorite,
  handleEditFavoriteLabel,
}: // deleteFavorite,
//   onVoteUnvoteSuccessful,
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

  const favoriteListName = favoriteList.name.split('_').join(' ');
  //TODO here display ICONS only on hover
  return (
    <div key={`${Math.random().toFixed(6).toString()}-${favoriteListName}`}>
      {/* //TODO add to locales */}
      <div className="title">FAVORITE {favoriteListName}</div>
      {favoriteList.list.length === 0 && (
        <div>No favorites yet in {favoriteListName.toUpperCase()} list</div>
      )}
      {favoriteList.list.map((favoriteItem) => {
        return (
          <FavoriteAccountsItemComponent
            favorite={favoriteItem}
            listName={favoriteList.name}
            handleDeleteFavorite={handleDeleteFavorite}
            handleEditFavoriteLabel={handleEditFavoriteLabel}
          />
        );
      })}
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

export const FavoriteAccountsListComponent = connector(FavoriteAccountsList);
