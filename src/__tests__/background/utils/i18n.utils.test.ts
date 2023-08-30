import getMessage from '@background/utils/i18n.utils';
describe('i18n.utils tests:\n', () => {
  const messagesJsonFile = (filePath: string) => require(filePath);

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });
  beforeEach(() => {
    jest.spyOn(chrome.runtime, 'getURL').mockImplementation((...args) => {
      return `public/${args[0]}`;
    });
    global.fetch = jest.fn().mockImplementation((...args): any => {
      return { json: () => messagesJsonFile(args[0]) };
    });
  });

  describe('getMessage cases:\n', () => {
    it('Must return message using EN from key popup_html_confirm', async () => {
      chrome.i18n.getUILanguage = jest.fn().mockReturnValue('en-US');
      const result = await getMessage('popup_html_confirm');
      expect(result).toBe('Confirm');
    });

    it('Must return message using FR from key popup_html_confirm', async () => {
      chrome.i18n.getUILanguage = jest.fn().mockReturnValue('fr-FR');
      const result = await getMessage('popup_html_confirm');
      expect(result).toBe('Confirmer');
    });

    it('Must return missing name message', async () => {
      chrome.i18n.getUILanguage = jest.fn().mockReturnValue('fr-FR');
      const result = await getMessage('popup_html_new_age_keychain');
      expect(result).toBe(`[Missing popup_html_new_age_keychain locale]`);
    });

    it('Must return message from EN as not found on ES', async () => {
      chrome.i18n.getUILanguage = jest.fn().mockReturnValue('es-ES');
      const sGetURL = jest.spyOn(chrome.runtime, 'getURL');
      const result = await getMessage(
        'popup_html_undelegation_pending_until_message',
      );
      expect(sGetURL).toBeCalledTimes(2);
      expect(sGetURL).toHaveBeenNthCalledWith(1, '_locales/es/messages.json');
      expect(sGetURL).toHaveBeenNthCalledWith(2, '_locales/en/messages.json');
      expect(result).toBe(
        'After being canceled, delegations take 5 days to return to your available Hive Power balance',
      );
    });

    it('Must return message with params', async () => {
      chrome.i18n.getUILanguage = jest.fn().mockReturnValue('en-US');
      const result = await getMessage('popup_html_transfer_recurrence_value', [
        '40',
        '5',
      ]);
      expect(result).toBe('Every 40 hours, 5 times');
    });
  });
});
