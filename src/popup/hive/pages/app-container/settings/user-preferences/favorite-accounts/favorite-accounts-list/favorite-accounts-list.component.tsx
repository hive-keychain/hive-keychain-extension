import { AutoCompleteValue } from '@interfaces/autocomplete.interface';
import {
  FavoriteUserList,
  FavoriteUserListName,
} from '@interfaces/favorite-user.interface';
import { RootState } from '@popup/multichain/store';
import React from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { FavoriteAccountsItemComponent } from 'src/popup/hive/pages/app-container/settings/user-preferences/favorite-accounts/favorite-accounts-item/favorite-accounts-item.component';

interface FavoriteAccountsListProps {
  favoriteList: FavoriteUserList;
  handleDeleteFavorite: (
    listName: FavoriteUserListName,
    favoriteItem: AutoCompleteValue,
  ) => void;
  handleEditFavoriteLabel: (
    listName: FavoriteUserListName,
    favoriteItem: AutoCompleteValue,
    newLabel: string,
  ) => void;
}

const FavoriteAccountsList = ({
  favoriteList,
  activeAccount,
  handleDeleteFavorite,
  handleEditFavoriteLabel,
}: PropsFromRedux) => {
  const favoriteListName = favoriteList.name.split('_').join(' ');
  return (
    <div
      className="favorite-accounts-list"
      key={`${Math.random().toFixed(6).toString()}-${favoriteListName}`}>
      {(!favoriteList.list || favoriteList.list.length === 0) && (
        <div className="text-no-favorites">
          {chrome.i18n.getMessage('popup_html_favorite_accounts_no_favorites')}
        </div>
      )}
      {favoriteList.list &&
        favoriteList.list.map((favoriteItem) => {
          return (
            <FavoriteAccountsItemComponent
              key={`${Math.random()
                .toFixed(6)
                .toString()}-${favoriteListName}-item`}
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
  return { activeAccount: state.hive.activeAccount };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector> &
  FavoriteAccountsListProps;

export const FavoriteAccountsListComponent = connector(FavoriteAccountsList);
