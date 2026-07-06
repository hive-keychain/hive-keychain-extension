import { Screen } from '@interfaces/screen.interface';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import { HiveScreen } from '@popup/hive/reference-data/hive-screen.enum';
import {
  isAccountSetupScreen,
  isAccountSetupScreenWithOwnCompletion,
  stackHasAccountSetupPage,
} from '@popup/multichain/utils/account-setup-screens.utils';

describe('account-setup-screens.utils', () => {
  it('treats Hive Auth and EVM wallet setup screens as account setup', () => {
    expect(isAccountSetupScreen(Screen.ACCOUNT_PAGE_ADD_BY_AUTH)).toBe(true);
    expect(isAccountSetupScreen(HiveScreen.CREATE_ACCOUNT_PAGE_STEP_ONE)).toBe(
      true,
    );
    expect(isAccountSetupScreen(EvmScreen.CREATE_EVM_WALLET)).toBe(true);
    expect(isAccountSetupScreen(Screen.HOME_PAGE)).toBe(false);
  });

  it('detects setup screens that complete their own post-submit navigation', () => {
    expect(
      isAccountSetupScreenWithOwnCompletion(
        EvmScreen.CREATE_EVM_WALLET_VERIFICATION,
      ),
    ).toBe(true);
    expect(
      isAccountSetupScreenWithOwnCompletion(
        EvmScreen.IMPORT_EVM_WALLET_CONFIRMATION,
      ),
    ).toBe(true);
    expect(
      isAccountSetupScreenWithOwnCompletion(EvmScreen.CREATE_EVM_WALLET),
    ).toBe(false);
  });

  it('detects account setup pages anywhere in the navigation stack', () => {
    expect(
      stackHasAccountSetupPage([
        { currentPage: Screen.SETTINGS_MAIN_PAGE },
        { currentPage: EvmScreen.IMPORT_EVM_WALLET },
      ]),
    ).toBe(true);
    expect(
      stackHasAccountSetupPage([{ currentPage: Screen.SETTINGS_MAIN_PAGE }]),
    ).toBe(false);
  });
});
