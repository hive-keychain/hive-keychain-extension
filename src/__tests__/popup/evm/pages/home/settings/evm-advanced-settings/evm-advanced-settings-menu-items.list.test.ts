import { Screen } from '@interfaces/screen.interface';
import { getEvmAdvancedSettingsMenuItems } from '@popup/evm/pages/home/settings/evm-advanced-settings/evm-advanced-settings-menu-items.list';

describe('evm-advanced-settings-menu-items tests:\n', () => {
  it('includes the provider compatibility page', () => {
    expect(getEvmAdvancedSettingsMenuItems(false)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'evm_menu_provider_compatibility',
          nextScreen: Screen.EVM_PROVIDER_SETTINGS,
        }),
      ]),
    );
  });
});
