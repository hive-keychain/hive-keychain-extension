import {Screen} from 'src/reference-data/screen.enum';

export interface MenuItem {
  label: string;
  icon?: string;
  nextScreen: Screen;
}
