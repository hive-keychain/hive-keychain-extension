import { ActiveAccount } from '@interfaces/active-account.interface';
import { FavoriteUserItems } from '@interfaces/favorite-user.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { exchanges } from '@popup/pages/app-container/home/buy-coins/buy-coins-list-item.list';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { AutoCompleteValue } from 'src/common-ui/input/input.component';
import LocalStorageUtils from 'src/utils/localStorage.utils';

export interface AutocompleteListOption {
  addExchanges?: boolean;
  addSwaps?: boolean;
  token?: string;
}

const getAutocompleteList = async (
  username: string,
  localAccounts: LocalAccount[],
  options?: AutocompleteListOption,
): Promise<AutoCompleteValue[]> => {
  const favoriteUsers: FavoriteUserItems =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.FAVORITE_USERS,
    );
  const autoCompleteList: AutoCompleteValue[] = [];
  if (favoriteUsers && favoriteUsers[username]) {
    for (const fav of favoriteUsers[username]) {
      if (
        !exchanges.find((exchange) => exchange.username === fav) &&
        !localAccounts.find((localAccount) => localAccount.name === fav)
      )
        autoCompleteList.push({ value: fav });
    }
  }
  for (const localAccount of localAccounts) {
    if (localAccount.name !== username) {
      autoCompleteList.push({
        value: localAccount.name,
      });
    }
  }
  if (options?.addExchanges)
    for (const exchange of exchanges) {
      if (
        ((options?.token && exchange.acceptedCoins.includes(options.token)) ||
          !options?.token) &&
        exchange.username.length > 0
      )
        autoCompleteList.push({
          value: exchange.username,
          subLabel: exchange.name,
        });
    }
  return autoCompleteList;
};

const saveFavoriteUser = async (
  username: string,
  activeAccount: ActiveAccount,
) => {
  let favoriteUser = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.FAVORITE_USERS,
  );
  if (!favoriteUser) {
    favoriteUser = { [activeAccount.name!]: [] };
  }
  if (!favoriteUser[activeAccount.name!]) {
    favoriteUser[activeAccount.name!] = [];
  }

  if (
    !favoriteUser[activeAccount.name!].includes(username) &&
    !exchanges.find((exchange) => exchange.username === username)
  ) {
    favoriteUser[activeAccount.name!].push({ account: username, label: '' });
  }
  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.FAVORITE_USERS,
    favoriteUser,
  );
};

export enum FavoriteUserListName {
  USERS = 'USERS',
  LOCAL_ACCOUNTS = 'LOCAL_ACCOUNTS',
  EXCHANGES = 'EXCHANGES',
}
export interface FavoriteUserList {
  name: FavoriteUserListName;
  list: FavoriteAccounts[];
}
export interface FavoriteAccounts {
  account: string;
  label: string;
  subLabel?: string;
}
const getAutocompleteListByCategories = async (
  username: string,
  localAccounts: LocalAccount[],
  options?: AutocompleteListOption,
): Promise<FavoriteUserList[]> => {
  const favoriteUsers: {
    [key: string]: any[];
  } = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.FAVORITE_USERS,
  );
  const favoriteUsersList: FavoriteUserList = {
    name: FavoriteUserListName.USERS,
    list: [],
  };
  const favoriteLocalAccountsList: FavoriteUserList = {
    name: FavoriteUserListName.LOCAL_ACCOUNTS,
    list: [],
  };
  const favoriteExchangesList: FavoriteUserList = {
    name: FavoriteUserListName.EXCHANGES,
    list: [],
  };
  const favoriteUsersCompleteList: FavoriteUserList[] = [];
  if (favoriteUsers && favoriteUsers[username]) {
    for (const fav of favoriteUsers[username]) {
      if (
        !exchanges.find((exchange) => exchange.username === fav) &&
        !localAccounts.find((localAccount) => localAccount.name === fav)
      )
        favoriteUsersList.list.push(fav);
    }
  }
  for (const localAccount of localAccounts) {
    if (localAccount.name !== username) {
      favoriteLocalAccountsList.list.push({
        account: localAccount.name,
        label: '',
      });
    }
  }
  if (options?.addExchanges)
    for (const exchange of exchanges) {
      if (
        ((options?.token && exchange.acceptedCoins.includes(options.token)) ||
          !options?.token) &&
        exchange.username.length > 0
      )
        favoriteExchangesList.list.push({
          account: exchange.username,
          label: '',
          subLabel: exchange.name,
        });
    }
  if (favoriteUsersList.list.length > 0) {
    favoriteUsersCompleteList.push(favoriteUsersList);
  }
  if (favoriteLocalAccountsList.list.length > 0) {
    favoriteUsersCompleteList.push(favoriteLocalAccountsList);
  }
  if (favoriteExchangesList.list.length > 0) {
    favoriteUsersCompleteList.push(favoriteExchangesList);
  }
  return favoriteUsersCompleteList;
};

export const FavoriteUserUtils = {
  getAutocompleteList,
  saveFavoriteUser,
  getAutocompleteListByCategories,
};
