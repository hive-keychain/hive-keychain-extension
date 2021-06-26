import {LocalAccount} from 'src/interfaces/local-account.interface';

export interface Accounts {
  list: LocalAccount[];
  hash?: string;
}
