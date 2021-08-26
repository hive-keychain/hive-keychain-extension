import { Screen } from 'src/reference-data/screen.enum';

export interface DropdownMenuItem {
  label: string;
  labelParams?: string[];
  icon: string;
  nextScreen: Screen;
}
