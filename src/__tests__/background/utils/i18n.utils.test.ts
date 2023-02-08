import getMessage from '@background/utils/i18n.utils';
import i18nUtilsMocks from 'src/__tests__/background/utils/mocks/i18n.utils.mocks';
describe('i18n.utils tests:\n', () => {
  const { mocks, methods, spies } = i18nUtilsMocks;
  methods.afterEach;
  methods.beforeEach;
  describe('getMessage cases:\n', () => {
    it('Must return message from EN', async () => {
      const lang = 'en-US';
      mocks.getUILanguage(lang);
      const result = await getMessage('popup_html_confirm');
      expect(result).toBe('Confirm');
    });
    it('Must return message from FR', async () => {
      const lang = 'fr-FR';
      mocks.getUILanguage(lang);
      const result = await getMessage('popup_html_confirm');
      expect(result).toBe('Confirmer');
    });
    it('Must return missing name message', async () => {
      const lang = 'fr-FR';
      const name = 'popup_html_new_age_keychain';
      mocks.getUILanguage(lang);
      const result = await getMessage(name);
      expect(result).toBe(`[Missing ${name} locale]`);
    });
    it('Must return message from EN as not found on ES', async () => {
      const lang = 'es-ES';
      const name = 'popup_html_undelegation_pending_until_message';
      mocks.getUILanguage(lang);
      const result = await getMessage(name);
      expect(spies.getURL).toBeCalledTimes(2);
      expect(spies.getURL.mock.calls).toEqual([
        ['_locales/es/messages.json'],
        ['_locales/en/messages.json'],
      ]);
      expect(result).toBe(
        'After being canceled, delegations take 5 days to return to your available Hive Power balance',
      );
    });
    it('Must return message with params', async () => {
      const lang = 'en-US';
      const name = 'popup_html_transfer_recurrence_value';
      mocks.getUILanguage(lang);
      const result = await getMessage(name, ['40', '5']);
      expect(result).toBe('Every 40 hours, 5 times');
    });
  });
});
