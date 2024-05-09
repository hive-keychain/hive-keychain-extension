import { Screen } from '@interfaces/screen.interface';
import { SVGIcons } from 'src/common-ui/icons.enum';

export interface ActionButton {
  label: string;
  nextScreen: Screen;
  nextScreenParams?: any;
  icon: SVGIcons;
}
