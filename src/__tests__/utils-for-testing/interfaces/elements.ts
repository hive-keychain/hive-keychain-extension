import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';

export interface ElementQuery {
  arialabelOrText: string;
  query: QueryDOM;
  exact?: boolean;
}

export interface ArrowDrop {
  arrow: string;
  dropMenu: string;
}
