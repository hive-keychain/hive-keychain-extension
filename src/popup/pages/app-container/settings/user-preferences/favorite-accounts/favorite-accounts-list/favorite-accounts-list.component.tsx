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
import React from 'react';
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
