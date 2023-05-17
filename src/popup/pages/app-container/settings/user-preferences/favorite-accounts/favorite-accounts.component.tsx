import { AutoCompleteValue } from '@interfaces/autocomplete.interface';
import { FavoriteUserItems } from '@interfaces/favorite-user.interface';
import { LocalAccountListItem } from '@interfaces/list-item.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { loadActiveAccount } from '@popup/actions/active-account.actions';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { FavoriteAccountsListComponent } from '@popup/pages/app-container/settings/user-preferences/favorite-accounts/favorite-accounts-list/favorite-accounts-list.component';
import { RootState } from '@popup/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect, useState } from 'react';
import Select, {
  SelectItemRenderer,
  SelectRenderer,
} from 'react-dropdown-select';
import { ConnectedProps, connect } from 'react-redux';
import {
  FavoriteAccounts,
  FavoriteUserList,
  FavoriteUserListName,
  FavoriteUserUtils,
} from 'src/utils/favorite-user.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import './favorite-accounts.component.scss';

const FavoriteAccounts = ({
  accounts,
  activeAccount,
  localAccounts,
  loadActiveAccount,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const defaultOptions: LocalAccountListItem[] = [];
  const [options, setOptions] = useState(defaultOptions);
  const [selectedLocalAccount, setSelectedLocalAccount] = useState(
    accounts[0].name,
  );
  const [favoriteAccountsList, setFavoriteAccountsList] = useState<
    FavoriteUserList[]
  >([{ name: FavoriteUserListName.USERS, list: [] }]);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_favorite_accounts',
      isBackButtonEnabled: true,
    });
  }, []);

  useEffect(() => {
    init();
    setOptions(
      accounts.map((account: LocalAccount) => {
        return { label: account.name, value: account.name };
      }),
    );

    setSelectedLocalAccount(activeAccount.name!);
  }, [accounts, activeAccount]);

  const init = async () => {
    const favoriteUsers = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.FAVORITE_USERS,
    );

    await FavoriteUserUtils.fixFavoriteList(favoriteUsers);

    setFavoriteAccountsList([
      {
        name: FavoriteUserListName.USERS,
        list: favoriteUsers[activeAccount.name!],
      },
    ]);
  };

  const handleItemClicked = (accountName: string) => {
    const itemClicked = accounts.find(
      (account: LocalAccount) => account.name === accountName,
    );
    loadActiveAccount(itemClicked!);
  };

  const customLabelRender = (
    selectProps: SelectRenderer<LocalAccountListItem>,
  ) => {
    return (
      <div
        className="selected-account-panel"
        onClick={() => {
          selectProps.methods.dropDown('close');
        }}>
        <img
          src={`https://images.hive.blog/u/${selectedLocalAccount}/avatar`}
          onError={(e: any) => {
            e.target.onError = null;
            e.target.src = '/assets/images/accounts.png';
          }}
        />
        <div className="selected-account-name">{selectedLocalAccount}</div>
      </div>
    );
  };
  const customItemRender = (
    selectProps: SelectItemRenderer<LocalAccountListItem>,
  ) => {
    return (
      <div
        aria-label={`select-account-item-${selectProps.item.label}`}
        className={`select-account-item ${
          selectedLocalAccount === selectProps.item.value ? 'selected' : ''
        }`}
        onClick={() => {
          handleItemClicked(selectProps.item.value);
          selectProps.methods.dropDown('close');
        }}>
        <img
          src={`https://images.hive.blog/u/${selectProps.item.label}/avatar`}
          onError={(e: any) => {
            e.target.onError = null;
            e.target.src = '/assets/images/accounts.png';
          }}
        />
        <div className="account-name">{selectProps.item.label}</div>
      </div>
    );
  };

  const handleDeleteFavorite = (
    listName: FavoriteUserListName,
    favoriteItem: AutoCompleteValue,
  ) => {
    const favoriteAccountsListCopy = [...favoriteAccountsList];
    const selectedList = favoriteAccountsListCopy.filter(
      (favoriteList) => favoriteList.name === listName,
    )[0];
    const filteredSelectedList = selectedList.list.filter(
      (favorite) => favorite !== favoriteItem,
    );
    selectedList.list = filteredSelectedList;
    setFavoriteAccountsList([...favoriteAccountsListCopy]);
    saveFavoriteList(selectedList);
  };

  const saveFavoriteList = async (list: FavoriteUserList) => {
    const actualFavoriteUsersLists: FavoriteUserItems[] =
      await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.FAVORITE_USERS,
      );
    const updatedFavoriteUserLists = {
      ...actualFavoriteUsersLists,
      [activeAccount.name!]: list.list,
    };
    LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.FAVORITE_USERS,
      updatedFavoriteUserLists,
    );
  };

  const handleEditFavoriteLabel = (
    listName: FavoriteUserListName,
    favoriteItem: AutoCompleteValue,
    newLabel: string,
  ) => {
    const favoriteAccountsListCopy = [...favoriteAccountsList];
    const selectedList = favoriteAccountsListCopy.filter(
      (favoriteList) => favoriteList.name === listName,
    )[0];
    const favoriteItemIndexToEdit = selectedList.list.findIndex(
      (favorite) => favorite === favoriteItem,
    );
    selectedList.list[favoriteItemIndexToEdit] = {
      ...selectedList.list[favoriteItemIndexToEdit],
      subLabel: newLabel,
    };
    setFavoriteAccountsList([...favoriteAccountsListCopy]);
    saveFavoriteList(selectedList);
  };

  return (
    <div
      aria-label={`${Screen.SETTINGS_FAVORITE_ACCOUNTS}-page`}
      className="favorite-accounts-page">
      <div className="intro padding">
        {chrome.i18n.getMessage('popup_html_favorite_accounts_intro')}
      </div>
      <div className="select padding">
        <Select
          values={[selectedLocalAccount as any]}
          options={options}
          onChange={() => undefined}
          contentRenderer={customLabelRender}
          itemRenderer={customItemRender}
          className="select-account-select"
        />
      </div>
      <FavoriteAccountsListComponent
        key={`${Math.random().toFixed(6).toString()}-${
          FavoriteUserListName.USERS
        }`}
        favoriteList={
          favoriteAccountsList.filter(
            (favoriteList) => favoriteList.name === FavoriteUserListName.USERS,
          )[0]
        }
        handleDeleteFavorite={handleDeleteFavorite}
        handleEditFavoriteLabel={handleEditFavoriteLabel}
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    accounts: state.accounts,
    activeAccount: state.activeAccount,
    localAccounts: state.accounts,
  };
};

const connector = connect(mapStateToProps, {
  loadActiveAccount,
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const FavoriteAccountsComponent = connector(FavoriteAccounts);
