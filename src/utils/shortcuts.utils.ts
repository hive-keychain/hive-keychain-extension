import { HiveScreen } from '@popup/hive/reference-data/hive-screen.enum';
import { MultichainScreen } from '@popup/multichain/reference-data/multichain-screen.enum';

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

const NAVIGATION_SCREENS: (MultichainScreen | HiveScreen)[] = [
  MultichainScreen.HOME_PAGE,
  MultichainScreen.TRANSFER_FUND_PAGE,
  // Screen.RECURRENT_TRANSFERS_PAGE,
  HiveScreen.WALLET_HISTORY_PAGE,

  HiveScreen.POWER_UP_PAGE,
  HiveScreen.POWER_DOWN_PAGE,
  HiveScreen.SAVINGS_PAGE,
  HiveScreen.CONVERSION_PAGE,
  HiveScreen.DELEGATION_PAGE,
  HiveScreen.RC_DELEGATIONS_PAGE,

  MultichainScreen.BUY_COINS_PAGE,
  HiveScreen.GOVERNANCE_PAGE,

  // Screen.TOKENS_PAGE,

  // Screen.TOKENS_SETTINGS,
  // Screen.TOKENS_OPERATION,
  // Screen.TOKENS_DELEGATIONS,
  // Screen.TOKENS_PENDING_UNSTAKE,

  // Screen.PENDING_CONVERSION_PAGE,
  // Screen.PENDING_SAVINGS_WITHDRAWAL_PAGE,
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
  HiveScreen.SETTINGS_SHORTCUTS,
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
  MultichainScreen.SETTINGS_ABOUT,
  MultichainScreen.SETTINGS_ANALYTICS,
  HiveScreen.SETTINGS_NOTIFICATIONS_CONFIGURATION,
  HiveScreen.SETTINGS_HELP,
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

const formatScreenLabel = (screen: MultichainScreen | HiveScreen) => {
  return screen
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .filter((part) => part !== 'Page')
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
