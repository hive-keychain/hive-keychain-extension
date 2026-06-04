import { Screen } from '@interfaces/screen.interface';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import { HiveScreen } from '@popup/hive/reference-data/hive-screen.enum';

const ACCOUNT_SETUP_SCREENS = new Set<Screen>([
  Screen.ACCOUNT_PAGE_INIT_ACCOUNT,
  Screen.SIGN_IN_PAGE,
  Screen.ACCOUNT_PAGE_ADD_BY_KEYS,
  Screen.ACCOUNT_PAGE_ADD_BY_AUTH,
  Screen.ACCOUNT_PAGE_SELECT_KEYS,
  Screen.ACCOUNT_PAGE_IMPORT_KEYS,
  Screen.ACCOUNT_PAGE_KEYLESS_KEYCHAIN,
  HiveScreen.ACCOUNT_PAGE_ADD_ACCOUNTS_FROM_LEDGER,
  HiveScreen.CREATE_ACCOUNT_PAGE_STEP_ONE,
  HiveScreen.CREATE_ACCOUNT_PAGE_STEP_TWO,
  EvmScreen.EVM_ADD_ACCOUNTS_FROM_LEDGER,
  EvmScreen.IMPORT_EVM_WALLET,
  EvmScreen.IMPORT_EVM_WALLET_FROM_KEY,
  EvmScreen.IMPORT_EVM_WALLET_CONFIRMATION,
  EvmScreen.CREATE_EVM_WALLET,
  EvmScreen.CREATE_EVM_WALLET_VERIFICATION,
]);

export const isAccountSetupScreen = (screen: Screen): boolean =>
  ACCOUNT_SETUP_SCREENS.has(screen);

export const stackHasAccountSetupPage = (
  stack: { currentPage: Screen }[],
): boolean =>
  stack.some((navigation) => isAccountSetupScreen(navigation.currentPage));
