import { Screen } from '@interfaces/screen.interface';
import { getSettingsHelpAndAboutMenuItems } from 'src/popup/multichain/pages/settings/settings-help-and-about-menu-items';

describe('getSettingsHelpAndAboutMenuItems', () => {
  it('lists support, tutorial, and about in order', () => {
    const menuItems = getSettingsHelpAndAboutMenuItems();

    expect(menuItems.map((item) => item.label)).toEqual([
      'popup_html_contact_support',
      'popup_html_tutorial',
      'popup_html_about',
    ]);
    expect(menuItems[0].action).toBeDefined();
    expect(menuItems[1].action).toBeDefined();
    expect(menuItems[2].nextScreen).toBe(Screen.SETTINGS_ABOUT);
  });
});
