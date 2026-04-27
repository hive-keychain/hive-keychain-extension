import { ShortcutAccountType } from '@interfaces/shortcut.interface';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import { HiveScreen } from '@popup/hive/reference-data/hive-screen.enum';
import { MultichainScreen } from '@popup/multichain/reference-data/multichain-screen.enum';

type ShortcutNavigationScreen = MultichainScreen | HiveScreen | EvmScreen;

/** `chrome.i18n` message keys; reuse existing settings/page titles where possible. */
const SHORTCUT_NAVIGATION_SCREEN_MESSAGE_KEYS: Partial<
  Record<ShortcutNavigationScreen, string>
> = {
  [MultichainScreen.HOME_PAGE]: 'popup_html_shortcut_nav_HOME_PAGE',
  [MultichainScreen.TRANSFER_FUND_PAGE]: 'popup_html_transfer_funds',
  [MultichainScreen.BUY_COINS_PAGE]: 'popup_html_buy',
  [MultichainScreen.TOKEN_SWAP_PAGE]: 'dialog_title_swap',
  [MultichainScreen.TOKENS_SWAP_HISTORY]: 'html_popup_token_swaps_history',
  [MultichainScreen.SETTINGS_ABOUT]: 'popup_html_about',
  [MultichainScreen.SETTINGS_SHORTCUTS]: 'popup_html_shortcuts',

  [HiveScreen.RECURRENT_TRANSFERS_PAGE]: 'popup_html_recurrent_transfers',
  [HiveScreen.WALLET_HISTORY_PAGE]: 'popup_html_wallet_history',
  [HiveScreen.POWER_UP_PAGE]: 'popup_html_pu',
  [HiveScreen.POWER_DOWN_PAGE]: 'popup_html_pd',
  [HiveScreen.SAVINGS_PAGE]: 'popup_html_savings',
  [HiveScreen.CONVERSION_PAGE]: 'popup_html_convert',
  [HiveScreen.DELEGATION_PAGE]: 'popup_html_delegation',
  [HiveScreen.RC_DELEGATIONS_PAGE]: 'popup_html_rc_delegation_title',
  [HiveScreen.GOVERNANCE_PAGE]: 'popup_html_governance',
  [HiveScreen.TOKENS_HISTORY]: 'popup_html_tokens_history',
  [HiveScreen.TOKENS_TRANSFER]: 'popup_html_transfer_tokens',
  [HiveScreen.TOKENS_DELEGATIONS]: 'popup_html_delegations',
  [HiveScreen.TOKENS_PENDING_UNSTAKE]: 'popup_html_token_pending_unstake',
  [HiveScreen.CREATE_ACCOUNT_PAGE_STEP_ONE]: 'popup_html_create_account',
  [HiveScreen.SETTINGS_MAIN_PAGE]: 'popup_html_settings',
  [HiveScreen.SETTINGS_ACCOUNTS]: 'popup_html_accounts',
  [HiveScreen.SETTINGS_EXPORT_ACCOUNTS]: 'popup_html_export_accounts',
  [HiveScreen.SETTINGS_EXPORT_ALL_ACCOUNTS_QR]:
    'popup_html_export_all_accounts_as_QR',
  [HiveScreen.SETTINGS_ADD_ACCOUNT]: 'popup_html_add_account',
  [HiveScreen.SETTINGS_MANAGE_ACCOUNTS]: 'popup_html_manage_accounts',
  [HiveScreen.SETTINGS_MANAGE_ACCOUNTS_AUTHORITIES]:
    'popup_html_manage_accounts_authorities',
  [HiveScreen.SETTINGS_ADD_KEY]: 'popup_html_add_key',
  [HiveScreen.SETTINGS_ADVANCED]: 'popup_html_advanced_settings',
  [HiveScreen.SETTINGS_CHANGE_PASSWORD]: 'popup_html_change_password',
  [HiveScreen.SETTINGS_RPC_NODES]: 'popup_html_rpc_node',
  [HiveScreen.SETTINGS_AUTO_LOCK]: 'popup_html_autolock',
  [HiveScreen.SETTINGS_KEYCHAINIFY]: 'popup_html_keychainify',
  [HiveScreen.SETTINGS_CLEAR_ALL_DATA]: 'popup_html_clear',
  [HiveScreen.SETTINGS_IMPORT_EXPORT]: 'popup_html_import_export_settings',
  [HiveScreen.SETTINGS_USER_PREFERENCES]: 'popup_html_user_preferences',
  [HiveScreen.SETTINGS_AUTOMATED_TASKS]: 'popup_html_automated_tasks',
  [HiveScreen.SETTINGS_AUTHORIZED_OPERATIONS]: 'popup_html_operations',
  [HiveScreen.SETTINGS_EXPORT_TRANSACTIONS]: 'popup_html_export_transactions',
  [HiveScreen.SETTINGS_FAVORITE_ACCOUNTS]: 'popup_html_favorite_accounts',
  [HiveScreen.SETTINGS_MULTISIG]: 'popup_html_multisig',
  [HiveScreen.SETTINGS_OPERATION_POPUP]: 'popup_html_operation_popup',
  [HiveScreen.SETTINGS_NOTIFICATIONS_CONFIGURATION]:
    'html_popup_settings_notifications',
  [HiveScreen.SETTINGS_HELP]: 'popup_html_help',

  [EvmScreen.LIFI_HISTORY_PAGE]: 'html_popup_token_swaps_history',
  [EvmScreen.EVM_SETTINGS]: 'popup_html_settings',
  [EvmScreen.EVM_ACCOUNTS_SETTINGS]: 'evm_seeds_and_accounts',
  [EvmScreen.EVM_ADVANCED_SETTINGS]: 'popup_html_advanced_settings',
  [EvmScreen.EVM_CONTACTS]: 'evm_menu_contacts',
  [EvmScreen.EVM_CUSTOM_CHAINS]: 'evm_menu_custom_chains',
  [EvmScreen.EVM_CUSTOM_TOKENS_PAGE]: 'evm_custom_tokens_page_title',
  [EvmScreen.EVM_CUSTOM_NFTS_PAGE]: 'evm_custom_nfts_page_title',
  [EvmScreen.EVM_RPC_NODES_SETTINGS]: 'evm_menu_rpc_node',
  [EvmScreen.EVM_SECURITY_SETTINGS]: 'evm_menu_security',
  [EvmScreen.EVM_PROVIDER_SETTINGS]: 'evm_menu_provider_compatibility',
};

const getShortcutNavigationScreenMessageKey = (
  screen: ShortcutNavigationScreen,
): string =>
  SHORTCUT_NAVIGATION_SCREEN_MESSAGE_KEYS[screen] ??
  `popup_html_shortcut_nav_${screen}`;

const MODIFIER_KEYS = ['Shift', 'Control', 'Alt', 'Meta'];
const MODIFIER_ORDER = ['ctrl', 'alt', 'shift', 'command'];

const SPECIAL_KEY_LABELS: Record<string, string> = {
  ' ': 'Space',
  Escape: 'Esc',
  ArrowUp: 'Up',
  ArrowDown: 'Down',
  ArrowLeft: 'Left',
  ArrowRight: 'Right',
};

const SPECIAL_KEY_VALUES: Record<string, string> = {
  ' ': 'space',
  Escape: 'esc',
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

const isEditableTarget = (target: EventTarget | null) => {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toUpperCase();
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tagName)) return true;
  return target.isContentEditable;
};

const normalizeModifier = (modifier: string) => {
  const normalized = modifier.trim().toLowerCase();
  // Support display symbols (e.g. "⌘+⇧+W") used in UI formatting.
  if (normalized === '⌘') return 'command';
  if (normalized === '⇧') return 'shift';
  if (normalized === '⌥') return 'alt';
  if (normalized === '⌃') return 'ctrl';
  if (['control', 'ctrl'].includes(normalized)) return 'ctrl';
  if (['alt', 'option'].includes(normalized)) return 'alt';
  if (normalized === 'shift') return 'shift';
  if (['meta', 'cmd', 'command'].includes(normalized)) return 'command';
  return normalized;
};

const normalizeKey = (key: string) => {
  if (SPECIAL_KEY_VALUES[key]) return SPECIAL_KEY_VALUES[key];
  const normalized = key.trim().toLowerCase();
  if (SPECIAL_KEY_VALUES[normalized]) return SPECIAL_KEY_VALUES[normalized];
  return normalized;
};

const normalizeShortcutCombo = (combo: string) => {
  if (!combo) return '';
  const parts = combo.split('+').map((part) => part.trim());
  const modifiers = new Set<string>();
  let key = '';

  parts.forEach((part) => {
    const normalized = normalizeModifier(part);
    if (MODIFIER_ORDER.includes(normalized)) {
      modifiers.add(normalized);
    } else if (part) {
      key = normalizeKey(part);
    }
  });

  const ordered = MODIFIER_ORDER.filter((modifier) => modifiers.has(modifier));
  if (key) ordered.push(key);
  return ordered.join('+');
};

const formatModifierLabel = (modifier: string) => {
  switch (modifier) {
    case 'ctrl':
      return '⌃';
    case 'alt':
      return '⌥';
    case 'shift':
      return '⇧';
    case 'command':
      return '⌘';
    default:
      return modifier;
  }
};

const formatKeyLabel = (key: string) => {
  const displayKey = SPECIAL_KEY_LABELS[key] ?? key;
  if (displayKey.length === 1) return displayKey.toUpperCase();
  return displayKey.charAt(0).toUpperCase() + displayKey.slice(1);
};

const formatShortcutCombo = (combo: string) => {
  const normalized = normalizeShortcutCombo(combo);
  if (!normalized) return '';
  const parts = normalized.split('+');
  const formatted = parts.map((part) => {
    if (MODIFIER_ORDER.includes(part)) return formatModifierLabel(part);
    return formatKeyLabel(part);
  });
  return formatted.join('+');
};

const isModifierKey = (key: string) => MODIFIER_KEYS.includes(key);

const buildShortcutComboFromEvent = (event: KeyboardEvent) => {
  if (isModifierKey(event.key)) return null;

  const parts: string[] = [];
  if (event.ctrlKey) parts.push('ctrl');
  if (event.altKey) parts.push('alt');
  if (event.shiftKey) parts.push('shift');
  if (event.metaKey) parts.push('command');

  const keyLabel = normalizeKey(event.key);
  if (!keyLabel) return null;

  parts.push(keyLabel);
  return normalizeShortcutCombo(parts.join('+'));
};

const SHARED_NAVIGATION_SCREENS: MultichainScreen[] = [
  MultichainScreen.HOME_PAGE,
  MultichainScreen.TRANSFER_FUND_PAGE,
  MultichainScreen.BUY_COINS_PAGE,
  MultichainScreen.TOKEN_SWAP_PAGE,
  MultichainScreen.TOKENS_SWAP_HISTORY,
  MultichainScreen.SETTINGS_ABOUT,
  MultichainScreen.SETTINGS_SHORTCUTS,
];

const HIVE_NAVIGATION_SCREENS: HiveScreen[] = [
  HiveScreen.RECURRENT_TRANSFERS_PAGE,
  HiveScreen.WALLET_HISTORY_PAGE,

  HiveScreen.POWER_UP_PAGE,
  HiveScreen.POWER_DOWN_PAGE,
  HiveScreen.SAVINGS_PAGE,
  HiveScreen.CONVERSION_PAGE,
  HiveScreen.DELEGATION_PAGE,
  HiveScreen.RC_DELEGATIONS_PAGE,

  HiveScreen.GOVERNANCE_PAGE,

  HiveScreen.TOKENS_HISTORY,
  HiveScreen.TOKENS_TRANSFER,
  HiveScreen.TOKENS_DELEGATIONS,
  HiveScreen.TOKENS_PENDING_UNSTAKE,

  // Screen.INCOMING_OUTGOING_PAGE,
  // Screen.RC_DELEGATIONS_INCOMING_OUTGOING_PAGE,

  HiveScreen.CREATE_ACCOUNT_PAGE_STEP_ONE,
  HiveScreen.SETTINGS_MAIN_PAGE,
  HiveScreen.SETTINGS_ACCOUNTS,
  HiveScreen.SETTINGS_EXPORT_ACCOUNTS,
  HiveScreen.SETTINGS_EXPORT_ALL_ACCOUNTS_QR,
  HiveScreen.SETTINGS_ADD_ACCOUNT,
  HiveScreen.SETTINGS_MANAGE_ACCOUNTS,
  HiveScreen.SETTINGS_MANAGE_ACCOUNTS_AUTHORITIES,
  HiveScreen.SETTINGS_ADD_KEY,
  HiveScreen.SETTINGS_ADVANCED,
  HiveScreen.SETTINGS_CHANGE_PASSWORD,
  HiveScreen.SETTINGS_RPC_NODES,
  HiveScreen.SETTINGS_AUTO_LOCK,
  HiveScreen.SETTINGS_KEYCHAINIFY,
  HiveScreen.SETTINGS_CLEAR_ALL_DATA,
  HiveScreen.SETTINGS_IMPORT_EXPORT,
  HiveScreen.SETTINGS_USER_PREFERENCES,
  HiveScreen.SETTINGS_AUTOMATED_TASKS,
  HiveScreen.SETTINGS_AUTHORIZED_OPERATIONS,
  HiveScreen.SETTINGS_EXPORT_TRANSACTIONS,
  HiveScreen.SETTINGS_FAVORITE_ACCOUNTS,
  HiveScreen.SETTINGS_MULTISIG,
  HiveScreen.SETTINGS_OPERATION_POPUP,
  HiveScreen.SETTINGS_NOTIFICATIONS_CONFIGURATION,
  HiveScreen.SETTINGS_HELP,
];

const EVM_NAVIGATION_SCREENS: EvmScreen[] = [
  EvmScreen.LIFI_HISTORY_PAGE,
  EvmScreen.EVM_SETTINGS,
  EvmScreen.EVM_ACCOUNTS_SETTINGS,
  EvmScreen.EVM_ADVANCED_SETTINGS,
  EvmScreen.EVM_CONTACTS,
  EvmScreen.EVM_CUSTOM_CHAINS,
  EvmScreen.EVM_CUSTOM_TOKENS_PAGE,
  EvmScreen.EVM_CUSTOM_NFTS_PAGE,
  EvmScreen.EVM_RPC_NODES_SETTINGS,
  EvmScreen.EVM_SECURITY_SETTINGS,
  EvmScreen.EVM_PROVIDER_SETTINGS,
];

const NAVIGATION_SCREENS: (MultichainScreen | HiveScreen | EvmScreen)[] = [
  ...SHARED_NAVIGATION_SCREENS,
  ...HIVE_NAVIGATION_SCREENS,
  ...EVM_NAVIGATION_SCREENS,
];

const CURRENCY_REQUIRED_SCREENS: (MultichainScreen | HiveScreen)[] = [
  MultichainScreen.TRANSFER_FUND_PAGE,
  HiveScreen.SAVINGS_PAGE,
  HiveScreen.CONVERSION_PAGE,
];

const TOKEN_REQUIRED_SCREENS: (MultichainScreen | HiveScreen)[] = [
  HiveScreen.TOKENS_HISTORY,
  HiveScreen.TOKENS_TRANSFER,
  HiveScreen.TOKENS_DELEGATIONS,
];

const DELEGATION_REQUIRED_SCREENS: (MultichainScreen | HiveScreen)[] = [
  HiveScreen.TOKENS_DELEGATIONS,
];

const formatScreenLabel = (
  screen: MultichainScreen | HiveScreen | EvmScreen,
) => {
  return screen
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .filter((part) => part !== 'Page')
    .join(' ');
};

const createShortcutId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const buildShortcutAccountTarget = (
  accountType: ShortcutAccountType,
  accountId: string,
) => `${accountType.toLowerCase()}:${accountId}`;

const parseShortcutAccountTarget = (
  target: string,
  accountType?: ShortcutAccountType,
  accountId?: string,
) => {
  if (accountType && accountId) {
    return { accountType, accountId };
  }

  const separatorIndex = target.indexOf(':');
  if (separatorIndex > 0) {
    const prefix = target.slice(0, separatorIndex).toUpperCase();
    const id = target.slice(separatorIndex + 1);
    if (
      (prefix === ShortcutAccountType.HIVE ||
        prefix === ShortcutAccountType.EVM) &&
      id
    ) {
      return {
        accountType: prefix as ShortcutAccountType,
        accountId: id,
      };
    }
  }

  return {
    accountType: ShortcutAccountType.HIVE,
    accountId: target,
  };
};

const isHiveNavigationScreen = (screen: string) =>
  (HIVE_NAVIGATION_SCREENS as string[]).includes(screen);

const isEvmNavigationScreen = (screen: string) =>
  (EVM_NAVIGATION_SCREENS as string[]).includes(screen);

const isSharedNavigationScreen = (screen: string) =>
  (SHARED_NAVIGATION_SCREENS as string[]).includes(screen);

const ShortcutsUtils = {
  isEditableTarget,
  normalizeShortcutCombo,
  formatShortcutCombo,
  buildShortcutComboFromEvent,
  NAVIGATION_SCREENS,
  HIVE_NAVIGATION_SCREENS,
  EVM_NAVIGATION_SCREENS,
  SHARED_NAVIGATION_SCREENS,
  CURRENCY_REQUIRED_SCREENS,
  TOKEN_REQUIRED_SCREENS,
  DELEGATION_REQUIRED_SCREENS,
  formatScreenLabel,
  getShortcutNavigationScreenMessageKey,
  createShortcutId,
  buildShortcutAccountTarget,
  parseShortcutAccountTarget,
  isHiveNavigationScreen,
  isEvmNavigationScreen,
  isSharedNavigationScreen,
};

export {
  buildShortcutAccountTarget,
  buildShortcutComboFromEvent,
  createShortcutId,
  CURRENCY_REQUIRED_SCREENS,
  DELEGATION_REQUIRED_SCREENS,
  EVM_NAVIGATION_SCREENS,
  formatScreenLabel,
  formatShortcutCombo,
  getShortcutNavigationScreenMessageKey,
  HIVE_NAVIGATION_SCREENS,
  isEditableTarget,
  isEvmNavigationScreen,
  isHiveNavigationScreen,
  isSharedNavigationScreen,
  NAVIGATION_SCREENS,
  normalizeShortcutCombo,
  parseShortcutAccountTarget,
  SHARED_NAVIGATION_SCREENS,
  TOKEN_REQUIRED_SCREENS,
};

export default ShortcutsUtils;
