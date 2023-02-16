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
  if (!favoriteUsers) return [];
  else {
    const autoCompleteList: AutoCompleteValue[] = [];

    for (const fav of favoriteUsers[username]) {
      if (
        !exchanges.find((exchange) => exchange.username === fav) &&
        !localAccounts.find((localAccount) => localAccount.name === fav)
      )
        autoCompleteList.push({ value: fav });
    }
    for (const localAccount of localAccounts) {
      if (localAccount.name !== username) {
        autoCompleteList.push({
          value: localAccount.name,
          subLabel: chrome.i18n.getMessage('local'),
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
  }
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
    favoriteUser[activeAccount.name!].push(username);
  }
  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.FAVORITE_USERS,
    favoriteUser,
  );
};

export const FavoriteUserUtils = {
  getAutocompleteList,
  saveFavoriteUser,
};
