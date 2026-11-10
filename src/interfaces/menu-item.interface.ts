import { Screen } from '@interfaces/screen.interface';
import { SVGIcons } from 'src/common-ui/icons.enum';

export interface MenuItem {
  label: string;
  icon: SVGIcons;
  nextScreen?: Screen;
  sidePanelHash?: string;
  action?(params?: any): any;
  rightPanel?: any;
  experimental?: boolean;
}
