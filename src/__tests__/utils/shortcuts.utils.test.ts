import { Screen } from '@interfaces/screen.interface';
import { ShortcutAccountType } from '@interfaces/shortcut.interface';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import ShortcutsUtils from 'src/utils/shortcuts.utils';

describe('shortcuts.utils', () => {
  describe('isEditableTarget', () => {
    it('returns false for null and non-form divs', () => {
      expect(ShortcutsUtils.isEditableTarget(null)).toBe(false);
      const plainDiv = document.createElement('div');
      expect(Boolean(ShortcutsUtils.isEditableTarget(plainDiv))).toBe(false);
    });

    it('returns true for input, textarea, and select', () => {
      const input = document.createElement('input');
      expect(ShortcutsUtils.isEditableTarget(input)).toBe(true);

      const ta = document.createElement('textarea');
      expect(ShortcutsUtils.isEditableTarget(ta)).toBe(true);

      const sel = document.createElement('select');
      expect(ShortcutsUtils.isEditableTarget(sel)).toBe(true);
    });

    it('returns true when isContentEditable is true (jsdom does not set this from contenteditable attr)', () => {
      const div = document.createElement('div');
      Object.defineProperty(div, 'isContentEditable', {
        value: true,
        configurable: true,
      });
      expect(ShortcutsUtils.isEditableTarget(div)).toBe(true);
    });
  });

  describe('normalizeShortcutCombo', () => {
    it('orders modifiers and normalizes key names', () => {
      expect(ShortcutsUtils.normalizeShortcutCombo('shift+ctrl+a')).toBe(
        'ctrl+shift+a',
      );
      expect(ShortcutsUtils.normalizeShortcutCombo('⌘+⇧+W')).toBe(
        'shift+command+w',
      );
      expect(ShortcutsUtils.normalizeShortcutCombo('')).toBe('');
    });

    it('normalizes space and arrow keys', () => {
      expect(ShortcutsUtils.normalizeShortcutCombo('alt+Space')).toBe(
        'alt+space',
      );
      expect(ShortcutsUtils.normalizeShortcutCombo('meta+ArrowUp')).toBe(
        'command+up',
      );
    });
  });

  describe('formatShortcutCombo', () => {
    it('formats modifiers with symbols and title-cases keys', () => {
      expect(ShortcutsUtils.formatShortcutCombo('ctrl+shift+a')).toBe('⌃+⇧+A');
      expect(ShortcutsUtils.formatShortcutCombo('command+space')).toBe(
        '⌘+Space',
      );
    });
  });

  describe('buildShortcutComboFromEvent', () => {
    it('builds a normalized combo from modifier state and key', () => {
      const ev = new KeyboardEvent('keydown', {
        key: 'b',
        ctrlKey: true,
        shiftKey: true,
      });
      expect(ShortcutsUtils.buildShortcutComboFromEvent(ev)).toBe(
        'ctrl+shift+b',
      );
    });

    it('returns null for bare modifier keys', () => {
      const ev = new KeyboardEvent('keydown', { key: 'Shift' });
      expect(ShortcutsUtils.buildShortcutComboFromEvent(ev)).toBeNull();
    });
  });

  describe('formatScreenLabel', () => {
    it('drops trailing Page segment and title-cases parts', () => {
      expect(ShortcutsUtils.formatScreenLabel(Screen.HOME_PAGE)).toBe('Home');
      expect(ShortcutsUtils.formatScreenLabel(Screen.TRANSFER_FUND_PAGE)).toBe(
        'Transfer Fund',
      );
    });
  });

  describe('createShortcutId', () => {
    it('returns a hyphenated id', () => {
      const id = ShortcutsUtils.createShortcutId();
      expect(id).toMatch(/^[a-z0-9]+-[a-z0-9]+$/i);
    });
  });

  describe('screen lists', () => {
    it('includes core navigation targets', () => {
      expect(ShortcutsUtils.NAVIGATION_SCREENS).toContain(Screen.HOME_PAGE);
      expect(ShortcutsUtils.NAVIGATION_SCREENS).toContain(
        EvmScreen.EVM_ACCOUNTS_SETTINGS,
      );
      expect(ShortcutsUtils.CURRENCY_REQUIRED_SCREENS).toContain(
        Screen.TRANSFER_FUND_PAGE,
      );
      expect(ShortcutsUtils.TOKEN_REQUIRED_SCREENS).toContain(
        Screen.TOKENS_HISTORY,
      );
    });
  });

  describe('account target compatibility', () => {
    it('builds typed account targets', () => {
      expect(
        ShortcutsUtils.buildShortcutAccountTarget(
          ShortcutAccountType.EVM,
          '0xabc',
        ),
      ).toBe('evm:0xabc');
    });

    it('parses typed and legacy account targets', () => {
      expect(ShortcutsUtils.parseShortcutAccountTarget('evm:0xabc')).toEqual({
        accountType: ShortcutAccountType.EVM,
        accountId: '0xabc',
      });
      expect(ShortcutsUtils.parseShortcutAccountTarget('alice')).toEqual({
        accountType: ShortcutAccountType.HIVE,
        accountId: 'alice',
      });
    });
  });
});
