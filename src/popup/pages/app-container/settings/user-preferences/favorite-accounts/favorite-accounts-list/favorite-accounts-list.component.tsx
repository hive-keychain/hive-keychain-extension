import { AutoCompleteValue } from '@interfaces/autocomplete.interface';
import { FavoriteAccountsItemComponent } from '@popup/pages/app-container/settings/user-preferences/favorite-accounts/favorite-accounts-item/favorite-accounts-item.component';
import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
  FavoriteUserList,
  FavoriteUserListName,
} from 'src/utils/favorite-user.utils';
import './favorite-accounts-list.component.scss';

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
      {favoriteList.list.length === 0 && (
        <div className="text-no-favorites">
          {chrome.i18n.getMessage('popup_html_favorite_accounts_no_favorites', [
            favoriteListName,
          ])}
        </div>
      )}
      {favoriteList.list.map((favoriteItem) => {
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
  return { activeAccount: state.activeAccount };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector> &
  FavoriteAccountsListProps;

export const FavoriteAccountsListComponent = connector(FavoriteAccountsList);
