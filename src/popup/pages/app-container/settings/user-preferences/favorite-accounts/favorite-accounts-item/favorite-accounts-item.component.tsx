import { AutoCompleteValue } from '@interfaces/autocomplete.interface';
import { FavoriteUserListName } from '@interfaces/favorite-user.interface';
import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import './favorite-accounts-item.component.scss';

interface FavoriteAccountsItemProps {
  favorite: AutoCompleteValue;
  handleDeleteFavorite: (
    favoriteUserListName: FavoriteUserListName,
    favoriteItem: AutoCompleteValue,
  ) => void;
  handleEditFavoriteLabel: (
    listName: FavoriteUserListName,
    favoriteItem: AutoCompleteValue,
    newLabel: string,
  ) => void;
  listName: FavoriteUserListName;
}

const FavoriteAccountsItem = ({
  favorite,
  handleDeleteFavorite,
  handleEditFavoriteLabel,
  listName,
}: PropsFromRedux) => {
  const [label, setLabel] = useState('');
  const [isEditMode, setEditMode] = useState<boolean>(false);

  const save = () => {
    setEditMode(false);
    handleEditFavoriteLabel(listName, favorite, label);
  };

  const cancel = () => {
    setEditMode(false);
    setLabel('');
  };

  const edit = (favorite: AutoCompleteValue) => {
    setEditMode(true);
    setLabel(favorite.subLabel!);
  };

  const customLabelRender = (favorite: AutoCompleteValue) => {
    return (
      <div className="item-user-favorite">
        <img
          src={`https://images.hive.blog/u/${favorite.value}/avatar`}
          onError={(e: any) => {
            e.target.onError = null;
            e.target.src = '/assets/images/accounts.png';
          }}
        />
        {!isEditMode && (
          <div
            className={`item-username${
              favorite.value && favorite.value.length > 13 ? 'as-column' : ''
            }`}>
            <span>{favorite.value}</span>
            {
              <div className="item-username-label">
                {favorite.subLabel ? `${favorite.subLabel!}` : ''}
              </div>
            }
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="favorite-accounts-item">
      <div className="item">
        {customLabelRender(favorite)}
        <div className="buttons">
          {isEditMode && (
            <InputComponent
              onChange={(value) => setLabel(value)}
              type={InputType.TEXT}
              value={label}
              placeholder="popup_html_new_label"
            />
          )}
          {!isEditMode && (
            <Icon
              onClick={() => edit(favorite)}
              name={Icons.EDIT}
              type={IconType.OUTLINED}
              additionalClassName="edit-button"
            />
          )}
          {isEditMode && (
            <Icon
              onClick={() => save()}
              name={Icons.SAVE}
              type={IconType.OUTLINED}
              additionalClassName="edit-button"
            />
          )}
          {isEditMode && (
            <Icon
              onClick={() => cancel()}
              name={Icons.CLEAR}
              type={IconType.OUTLINED}
              additionalClassName="edit-button"
            />
          )}
          {!isEditMode && (
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
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector> &
  FavoriteAccountsItemProps;

export const FavoriteAccountsItemComponent = connector(FavoriteAccountsItem);
