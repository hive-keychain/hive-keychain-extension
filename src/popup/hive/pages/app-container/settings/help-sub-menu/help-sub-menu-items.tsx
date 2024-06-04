import { MenuItem } from '@interfaces/menu-item.interface';
import { SVGIcons } from 'src/common-ui/icons.enum';
import Config from 'src/config';

const HelpSubMenuItems: MenuItem[] = [
  {
    label: 'popup_html_contact_support',
    icon: SVGIcons.MENU_SUPPORT,
    action: () => {
      chrome.tabs.create({ url: 'https://discord.gg/3Sex2qYtXP' });
    },
  },
  {
    label: 'popup_html_tutorial',
    icon: SVGIcons.MENU_TUTORIAL,
    action: () => {
      chrome.tabs.create({ url: `${Config.tutorial.baseUrl}/#/extension` });
    },
  },
];

export default HelpSubMenuItems;
