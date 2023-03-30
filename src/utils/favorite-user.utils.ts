import BgdAccountsUtils from '@background/utils/accounts.utils';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { FavoriteUserItems } from '@interfaces/favorite-user.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { exchanges } from '@popup/pages/app-container/home/buy-coins/buy-coins-list-item.list';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import {
  AutoCompleteCategory,
  AutoCompleteValue,
  AutoCompleteValues,
} from 'src/common-ui/input/input.component';
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
  const mk = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.__MK,
  );
  const localAccounts = await BgdAccountsUtils.getAccountsFromLocalStorage(mk);
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
    !exchanges.find((exchange) => exchange.username === username) &&
    !localAccounts.find((localAccount) => localAccount.name === username)
  ) {
    favoriteUser[activeAccount.name!].push({
      value: username,
      subLabel: '',
    } as AutoCompleteValue);
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
): Promise<AutoCompleteValues> => {
  const favoriteUsers: {
    [key: string]: any[];
  } = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.FAVORITE_USERS,
  );
  const favoriteUsersList: AutoCompleteCategory = {
    title: FavoriteUserListName.USERS,
    values: [],
  };
  const favoriteLocalAccountsList: AutoCompleteCategory = {
    title: FavoriteUserListName.LOCAL_ACCOUNTS,
    values: [],
  };
  const favoriteExchangesList: AutoCompleteCategory = {
    title: FavoriteUserListName.EXCHANGES,
    values: [],
  };
  const favoriteUsersCompleteList: AutoCompleteValues = {
    categories: [],
  };

  if (favoriteUsers && favoriteUsers[username]) {
    for (const fav of favoriteUsers[username]) {
      if (
        !exchanges.find((exchange) => exchange.username === fav) &&
        !localAccounts.find((localAccount) => localAccount.name === fav)
      )
        favoriteUsersList.values.push(fav);
    }
  }
  for (const localAccount of localAccounts) {
    if (localAccount.name !== username) {
      favoriteLocalAccountsList.values.push({
        value: localAccount.name,
        subLabel: '',
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
        favoriteExchangesList.values.push({
          value: exchange.username,
          subLabel: exchange.name,
        });
    }
  if (favoriteUsersList.values.length > 0) {
    favoriteUsersCompleteList.categories.push(favoriteUsersList);
  }
  if (favoriteLocalAccountsList.values.length > 0) {
    favoriteUsersCompleteList.categories.push(favoriteLocalAccountsList);
  }
  if (favoriteExchangesList.values.length > 0) {
    favoriteUsersCompleteList.categories.push(favoriteExchangesList);
  }
  return favoriteUsersCompleteList;
};

export const FavoriteUserUtils = {
  getAutocompleteList,
  saveFavoriteUser,
  getAutocompleteListByCategories,
};
