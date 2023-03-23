import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import {
  FavoriteAccounts,
  FavoriteUserListName,
} from 'src/utils/favorite-user.utils';
import './favorite-accounts-item.component.scss';

interface FavoriteAccountsItemProps {
  favorite: FavoriteAccounts;
  handleDeleteFavorite: (
    favoriteUserListName: FavoriteUserListName,
    favoriteItem: FavoriteAccounts,
  ) => void;
  handleEditFavoriteLabel: (
    listName: FavoriteUserListName,
    favoriteItem: FavoriteAccounts,
    newLabel: string,
  ) => void;
  listName: FavoriteUserListName;
}

const FavoriteAccountsItem = ({
  favorite,
  handleDeleteFavorite,
  handleEditFavoriteLabel,
  listName,
  activeAccount,
}: PropsFromRedux) => {
  const [selectedFavoriteToEdit, setSelectedFavoriteToEdit] =
    useState<FavoriteAccounts>();
  const [label, setLabel] = useState('');

  const onClickEditIcon = () => {
    handleEditFavoriteLabel(listName, favorite, label);
    setSelectedFavoriteToEdit(undefined);
  };

  const onClickCancelIcon = () => {
    setSelectedFavoriteToEdit(undefined);
    setLabel('');
  };

  const handleAboutToEdit = (favorite: FavoriteAccounts) => {
    setSelectedFavoriteToEdit(favorite);
    setLabel(favorite.label);
  };

  const customLabelRender = (favorite: FavoriteAccounts) => {
    return (
      <div className="item-user-favorite">
        <img
          src={`https://images.hive.blog/u/${favorite.account}/avatar`}
          onError={(e: any) => {
            e.target.onError = null;
            e.target.src = '/assets/images/accounts.png';
          }}
        />
        <div className="item-username">
          {favorite.account}
          {selectedFavoriteToEdit !== favorite && (
            <div className="item-username-label">
              {favorite.label ? `(${favorite.label})` : ''}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="favorite-accounts-item">
      <div className="item">
        {customLabelRender(favorite)}
        <div className="buttons">
          {selectedFavoriteToEdit?.account === favorite.account && (
            <InputComponent
              onChange={setLabel}
              type={InputType.TEXT}
              value={label}
              placeholder="popup_html_new_label"
            />
          )}
          {selectedFavoriteToEdit?.account !== favorite.account && (
            <Icon
              onClick={() => handleAboutToEdit(favorite)}
              name={Icons.EDIT}
              type={IconType.OUTLINED}
              additionalClassName="edit-button"
            />
          )}
          {selectedFavoriteToEdit?.account === favorite.account && (
            <Icon
              onClick={() => onClickEditIcon()}
              name={Icons.SAVE}
              type={IconType.OUTLINED}
              additionalClassName="edit-button"
            />
          )}
          {selectedFavoriteToEdit?.account === favorite.account && (
            <Icon
              onClick={() => onClickCancelIcon()}
              name={Icons.CLEAR}
              type={IconType.OUTLINED}
              additionalClassName="edit-button"
            />
          )}
          {selectedFavoriteToEdit?.account !== favorite.account && (
            <Icon
              onClick={() => handleDeleteFavorite(listName, favorite)}
              name={Icons.DELETE}
              type={IconType.OUTLINED}
              additionalClassName="remove-button"
            />
          )}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return { activeAccount: state.activeAccount };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector> &
  FavoriteAccountsItemProps;

export const FavoriteAccountsItemComponent = connector(FavoriteAccountsItem);
