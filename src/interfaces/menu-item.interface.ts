import { SVGIcons } from 'src/common-ui/icons.enum';
import { Screen } from 'src/reference-data/screen.enum';

export interface MenuItem {
  label: string;
  icon: SVGIcons;
  nextScreen?: Screen;
  action?(params?: any): any;
  rightPanel?: any;
  experimental?: boolean;
}
