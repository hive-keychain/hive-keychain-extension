import { Icons } from '@popup/icons.enum';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';

export interface ElementQuery {
  arialabelOrText: string;
  query: QueryDOM;
}

export interface ArrowDrop {
  arrow: string;
  dropMenu: string;
}

export interface IconsPage {
  icon: Icons;
  ariaLabel: string;
}
