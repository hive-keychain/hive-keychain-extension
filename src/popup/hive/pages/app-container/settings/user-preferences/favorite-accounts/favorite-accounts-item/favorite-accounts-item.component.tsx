import { AutoCompleteValue } from '@interfaces/autocomplete.interface';
import { FavoriteUserListName } from '@interfaces/favorite-user.interface';
import React, { SyntheticEvent, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { NewIcons } from 'src/common-ui/icons.enum';
import { Separator } from 'src/common-ui/separator/separator.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { RootState } from 'src/popup/hive/store';

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
  const [isExpanded, setIsExpanded] = useState(false);

  const save = () => {
    setEditMode(false);
    handleEditFavoriteLabel(listName, favorite, label);
  };

  const cancel = () => {
    setEditMode(false);
    setLabel('');
  };

  const edit = (event: SyntheticEvent, favorite: AutoCompleteValue) => {
    event.stopPropagation();
    setEditMode(true);
    setIsExpanded(false);
    setLabel(favorite.subLabel!);
  };

  const deleteFavorite = (
    event: SyntheticEvent,
    listname: FavoriteUserListName,
    favorite: AutoCompleteValue,
  ) => {
    event.stopPropagation();
    handleDeleteFavorite(listname, favorite);
  };

  const toggleExpandablePanel = () => {
    if (!isEditMode) setIsExpanded(!isExpanded);
  };

  return (
    <div className="favorite-accounts-item" onClick={toggleExpandablePanel}>
      <div className="item">
        <div className="item-details">
          <img
            className="profile-picture"
            src={`https://images.hive.blog/u/${favorite.value}/avatar`}
            onError={(e: any) => {
              e.target.onError = null;
              e.target.src = '/assets/images/accounts.png';
            }}
          />
          <div className="names">
            <div className="username">{favorite.value}</div>
            <div className="label">
              {favorite.subLabel ? `${favorite.subLabel!}` : ''}
            </div>
          </div>
          {isExpanded && !isEditMode && (
            <SVGIcon icon={NewIcons.GLOBAL_ARROW} />
          )}
        </div>
        {isEditMode && (
          <div className="edit-panel">
            <input
              className="edit-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />

            <SVGIcon
              onClick={() => save()}
              icon={NewIcons.FAVORITE_ACCOUNTS_SAVE}
              className="edit-button"
            />
            <SVGIcon
              onClick={() => cancel()}
              icon={NewIcons.FAVORITE_ACCOUNTS_CANCEL}
              className="edit-button"
            />
          </div>
        )}
      </div>
      {isExpanded && (
        <div className="expandable-panel">
          <Separator type="horizontal" />
          <div className="expandable-panel-content">
            <div
              className="favorite-item-button edit"
              onClick={($event) => edit($event, favorite)}>
              <SVGIcon icon={NewIcons.FAVORITE_ACCOUNTS_EDIT} />
              <span className="label">
                {chrome.i18n.getMessage('html_popup_button_edit_label')}
              </span>
            </div>
            <div
              className="favorite-item-button delete"
              onClick={($event) => deleteFavorite($event, listName, favorite)}>
              <SVGIcon icon={NewIcons.FAVORITE_ACCOUNTS_DELETE} />
              <span className="label">
                {chrome.i18n.getMessage('delete_label')}
              </span>
            </div>
          </div>
        </div>
      )}
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
