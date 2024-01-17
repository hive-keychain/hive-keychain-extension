import { NewIcons } from 'src/common-ui/icons.enum';
import { Screen } from 'src/reference-data/screen.enum';

export interface ActionButton {
  label: string;
  nextScreen: Screen;
  nextScreenParams?: any;
  icon: NewIcons;
}
