import { Screen } from '@interfaces/screen.interface';
import { SettingsHiveMenuItems } from 'src/popup/multichain/pages/settings/settings-hive-menu-items';

describe('settings-hive-menu-items tests:\n', () => {
  it('does not expose export transactions from Hive settings', () => {
    expect(
      SettingsHiveMenuItems.some(
        (item) => item.nextScreen === Screen.SETTINGS_EXPORT_TRANSACTIONS,
      ),
    ).toBe(false);
  });
});
