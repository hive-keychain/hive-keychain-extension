import { Icons } from '@popup/icons.enum';
import { Screen } from 'src/reference-data/screen.enum';

export interface DropdownMenuItemInterface {
  label: string;
  labelParams?: string[];
  icon: Icons | string;
  importedIcon?: boolean;
  nextScreen: Screen;
  nextScreenParams?: any;
}
