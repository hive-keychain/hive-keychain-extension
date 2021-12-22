import { Icons } from '@popup/icons.enum';
import { Screen } from 'src/reference-data/screen.enum';

export interface MenuItem {
  label: string;
  icon?: string | Icons;
  nextScreen?: Screen;
  action?(params?: any): any;
}
