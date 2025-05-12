import { MultichainScreen } from '@popup/multichain/reference-data/multichain-screen.enum';
import { SVGIcons } from 'src/common-ui/icons.enum';

export interface ContextualMenu {
  sections: ContextualMenuSection[];
}

export interface ContextualMenuSection {
  title?: string;
  skipTranslation?: boolean;
  items: ContextualMenuSectionItem[];
}

export interface ContextualMenuSectionItem {
  label: string;
  skipTranslation?: boolean;
  icon: SVGIcons;
  nextPage?: MultichainScreen;
  onClick?: Function;
}
