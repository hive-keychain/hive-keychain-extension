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
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import {
  FavoriteAccounts,
  FavoriteUserListName,
} from 'src/utils/favorite-user.utils';
import './favorite-accounts-item.component.scss';

interface ProposalItemProps {
  //TODO change name & props as needed
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
  //   onVoteUnvoteSuccessful: () => void;
  // deleteFavorite: (category: string, favoriteItem: FavoriteAccounts) => void;
}

const FavoriteAccountsItem = ({
  favorite,
  handleDeleteFavorite,
  handleEditFavoriteLabel,
  listName,
  addToLoadingList,
  removeFromLoadingList,
  setErrorMessage,
  setSuccessMessage,
  activeAccount,
}: // deleteFavorite,
//   onVoteUnvoteSuccessful,
PropsFromRedux) => {
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

  return (
    <div className="favorite-accounts-item">
      <div className="item">
        <div>
          {favorite.account}{' '}
          {selectedFavoriteToEdit !== favorite &&
          favorite.label &&
          favorite.label.trim().length > 0
            ? `(${favorite.label})`
            : ''}
          {favorite.subLabel && favorite.subLabel.trim().length > 0
            ? `(${favorite.subLabel})`
            : ''}
        </div>
        <div className="buttons">
          {selectedFavoriteToEdit === favorite && (
            <InputComponent
              onChange={setLabel}
              type={InputType.TEXT}
              value={label}
              logo=""
              placeholder="popup_html_new_label"
              onEnterPress={onClickEditIcon}
            />
          )}
          {selectedFavoriteToEdit !== favorite && (
            <Icon
              tooltipMessage={
                'popup_html_edit_favorite_label_tooltip_text_button'
              }
              tooltipPosition={'top'}
              onClick={() => handleAboutToEdit(favorite)}
              name={Icons.EDIT}
              type={IconType.OUTLINED}
              additionalClassName="edit-button"
            />
          )}
          {selectedFavoriteToEdit === favorite && (
            <Icon
              tooltipMessage={
                'popup_html_save_favorite_label_tooltip_text_button'
              }
              tooltipPosition={'top'}
              onClick={() => onClickEditIcon()}
              name={Icons.SAVE}
              type={IconType.OUTLINED}
              additionalClassName="edit-button"
            />
          )}
          {selectedFavoriteToEdit === favorite && (
            <Icon
              tooltipMessage={
                'popup_html_cancel_favorite_label_tooltip_text_button'
              }
              tooltipPosition={'top'}
              onClick={() => onClickCancelIcon()}
              name={Icons.CLEAR}
              type={IconType.OUTLINED}
              additionalClassName="edit-button"
            />
          )}
          <Icon
            tooltipMessage={
              'popup_html_delete_favorite_label_tooltip_text_button'
            }
            tooltipPosition={'top'}
            onClick={() => handleDeleteFavorite(listName, favorite)}
            name={Icons.DELETE}
            type={IconType.OUTLINED}
            additionalClassName="remove-button"
          />
        </div>
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
