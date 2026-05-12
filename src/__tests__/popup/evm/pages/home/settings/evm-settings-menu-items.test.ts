import { Screen } from '@interfaces/screen.interface';
import { EvmSettingsMenuItems } from '@popup/evm/pages/home/settings/evm-settings-menu-items';

describe('EvmSettingsMenuItems', () => {
  it('places dApps connections after custom chains', () => {
    const menuItems = EvmSettingsMenuItems(jest.fn());
    const customChainsIndex = menuItems.findIndex(
      (item) => item.nextScreen === Screen.EVM_CUSTOM_CHAINS,
    );
    const dappsConnectionsIndex = menuItems.findIndex(
      (item) => item.nextScreen === Screen.EVM_DAPPS_CONNECTIONS,
    );

    expect(dappsConnectionsIndex).toBe(customChainsIndex + 1);
    expect(menuItems[dappsConnectionsIndex]).toEqual(
      expect.objectContaining({
        label: 'evm_menu_dapps_connections',
        nextScreen: Screen.EVM_DAPPS_CONNECTIONS,
      }),
    );
  });
});
