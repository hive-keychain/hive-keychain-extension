import { Icons } from '@popup/icons.enum';
import { Screen } from 'src/reference-data/screen.enum';

export interface ActionButton {
  label: string;
  nextScreen: Screen;
  nextScreenParams?: any;
  icon: string | Icons;
  importedIcon?: boolean;
}
