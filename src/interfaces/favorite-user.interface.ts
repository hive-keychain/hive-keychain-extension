import { AutoCompleteValue } from '@interfaces/autocomplete.interface';

export interface FavoriteUserItems {
  [key: string]: string[];
}

export enum FavoriteUserListName {
  USERS = 'users',
  LOCAL_ACCOUNTS = 'local_accounts',
  EXCHANGES = 'exchanges',
}
export interface FavoriteUserList {
  name: FavoriteUserListName;
  list: AutoCompleteValue[];
}
export interface FavoriteAccounts {
  account: string;
  label: string;
  subLabel?: string;
}
