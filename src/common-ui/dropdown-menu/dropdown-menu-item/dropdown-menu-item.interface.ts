import { Screen } from 'src/reference-data/screen.enum';

export interface DropdownMenuItemInterface {
  label: string;
  labelParams?: string[];
  icon: string;
  nextScreen: Screen;
  nextScreenParams?: any;
}
