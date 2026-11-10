import { MenuItem } from '@interfaces/menu-item.interface';
import { Screen } from '@interfaces/screen.interface';
import { SVGIcons } from 'src/common-ui/icons.enum';
import Config from 'src/config';

export const getSettingsHelpAndAboutMenuItems = (): MenuItem[] => [
  {
    label: 'popup_html_contact_support',
    icon: SVGIcons.MENU_SUPPORT,
    action: () => {
      chrome.tabs.create({ url: Config.social.discord });
    },
  },
  {
    label: 'popup_html_tutorial',
    icon: SVGIcons.MENU_TUTORIAL,
    action: () => {
      chrome.tabs.create({ url: `${Config.tutorial.baseUrl}/#/extension` });
    },
  },
  {
    label: 'popup_html_about',
    icon: SVGIcons.MENU_ABOUT,
    nextScreen: Screen.SETTINGS_ABOUT,
  },
];
