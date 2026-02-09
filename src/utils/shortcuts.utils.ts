import { Screen } from '@reference-data/screen.enum';


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

const NAVIGATION_SCREENS: Screen[] = [
 
  Screen.HOME_PAGE,
  Screen.TRANSFER_FUND_PAGE,
  // Screen.RECURRENT_TRANSFERS_PAGE,
  Screen.WALLET_HISTORY_PAGE,
  
  Screen.POWER_UP_PAGE,
  Screen.POWER_DOWN_PAGE,
  Screen.SAVINGS_PAGE,
  Screen.CONVERSION_PAGE,
  Screen.DELEGATION_PAGE,
  Screen.RC_DELEGATIONS_PAGE,

  Screen.TOKENS_TRANSFER,
  Screen.TOKENS_HISTORY,
  Screen.TOKEN_SWAP_PAGE,
  Screen.TOKENS_SWAP_HISTORY,

  Screen.BUY_COINS_PAGE,
  Screen.GOVERNANCE_PAGE,

  // Screen.TOKENS_PAGE,

  // Screen.TOKENS_SETTINGS,
  // Screen.TOKENS_OPERATION,
  // Screen.TOKENS_DELEGATIONS,
  // Screen.TOKENS_PENDING_UNSTAKE,

  // Screen.PENDING_CONVERSION_PAGE,
  // Screen.PENDING_SAVINGS_WITHDRAWAL_PAGE,
  // Screen.INCOMING_OUTGOING_PAGE,
  // Screen.RC_DELEGATIONS_INCOMING_OUTGOING_PAGE,

  Screen.CREATE_ACCOUNT_PAGE_STEP_ONE,
  Screen.SETTINGS_MAIN_PAGE,
  Screen.SETTINGS_ACCOUNTS,
  Screen.SETTINGS_EXPORT_ACCOUNTS,
  Screen.SETTINGS_EXPORT_ALL_ACCOUNTS_QR,
  Screen.SETTINGS_ADD_ACCOUNT,
  Screen.SETTINGS_MANAGE_ACCOUNTS,
  Screen.SETTINGS_MANAGE_ACCOUNTS_AUTHORITIES,
  Screen.SETTINGS_ADD_KEY,
  Screen.SETTINGS_ADVANCED,
  Screen.SETTINGS_SHORTCUTS,
  Screen.SETTINGS_CHANGE_PASSWORD,
  Screen.SETTINGS_RPC_NODES,
  Screen.SETTINGS_AUTO_LOCK,
  Screen.SETTINGS_KEYCHAINIFY,
  Screen.SETTINGS_CLEAR_ALL_DATA,
  Screen.SETTINGS_IMPORT_EXPORT,
  Screen.SETTINGS_USER_PREFERENCES,
  Screen.SETTINGS_AUTOMATED_TASKS,
  Screen.SETTINGS_AUTHORIZED_OPERATIONS,
  Screen.SETTINGS_EXPORT_TRANSACTIONS,
  Screen.SETTINGS_FAVORITE_ACCOUNTS,
  Screen.SETTINGS_MULTISIG,
  Screen.SETTINGS_OPERATION_POPUP,
  Screen.SETTINGS_ABOUT,
  Screen.SETTINGS_ANALYTICS,
  Screen.SETTINGS_NOTIFICATIONS_CONFIGURATION,
  Screen.SETTINGS_HELP,
];

const CURRENCY_REQUIRED_SCREENS: Screen[] = [
  Screen.TRANSFER_FUND_PAGE,
  Screen.SAVINGS_PAGE,
  Screen.CONVERSION_PAGE,
];

const TOKEN_REQUIRED_SCREENS: Screen[] = [
  Screen.TOKENS_HISTORY,
  Screen.TOKENS_TRANSFER,
  Screen.TOKENS_DELEGATIONS,
];

const DELEGATION_REQUIRED_SCREENS: Screen[] = [Screen.TOKENS_DELEGATIONS];

const formatScreenLabel = (screen: Screen) => {
  return screen
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase()).filter((part) => part !== 'page')
    .join(' ');
};

const createShortcutId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const ShortcutsUtils = {
  isEditableTarget,
  normalizeShortcutCombo,
  formatShortcutCombo,
  buildShortcutComboFromEvent,
  NAVIGATION_SCREENS,
  CURRENCY_REQUIRED_SCREENS,
  TOKEN_REQUIRED_SCREENS,
  DELEGATION_REQUIRED_SCREENS,
  formatScreenLabel,
  createShortcutId,
};

export default ShortcutsUtils;
