import { LocalStorageKeyEnum } from 'src/reference-data/local-storage-key.enum';
import { I18nUtils } from 'src/utils/i18n.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

describe('I18nUtils', () => {
  let getValueFromLocalStorageMock: jest.MockedFunction<
    typeof LocalStorageUtils.getValueFromLocalStorage
  >;
  let saveValueInLocalStorageMock: jest.MockedFunction<
    typeof LocalStorageUtils.saveValueInLocalStorage
  >;

  beforeEach(() => {
    getValueFromLocalStorageMock = jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue(undefined) as jest.MockedFunction<
      typeof LocalStorageUtils.getValueFromLocalStorage
    >;
    saveValueInLocalStorageMock = jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockResolvedValue() as jest.MockedFunction<
      typeof LocalStorageUtils.saveValueInLocalStorage
    >;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    I18nUtils.resetForTesting();
  });

  it('returns a message from the selected locale', () => {
    chrome.i18n.getUILanguage = jest.fn().mockReturnValue('fr-FR');

    expect(I18nUtils.getMessage('popup_html_confirm')).toBe('Confirmer');
  });

  it('uses exact locale matches before base language matches', () => {
    chrome.i18n.getUILanguage = jest.fn().mockReturnValue('zh-TW');

    expect(I18nUtils.getSupportedLocale('zh-TW')).toBe('zh-TW');
    expect(I18nUtils.getMessage('popup_html_confirm')).toBe('確認');
  });

  it('falls back to the base language when the exact locale is not available', () => {
    chrome.i18n.getUILanguage = jest.fn().mockReturnValue('es-MX');

    expect(I18nUtils.getSupportedLocale('es-MX')).toBe('es');
    expect(I18nUtils.getMessage('popup_html_confirm')).toBe('Confirmar');
  });

  it('falls back to English when a selected locale is missing a key', () => {
    chrome.i18n.getUILanguage = jest.fn().mockReturnValue('fr-FR');

    expect(I18nUtils.getMessage('popup_html_wrong_key_active')).toBe(
      'Wrong key. Please use active key',
    );
  });

  it('returns the key when the message is missing from every locale', () => {
    chrome.i18n.getUILanguage = jest.fn().mockReturnValue('fr-FR');

    expect(I18nUtils.getMessage('popup_html_new_age_keychain')).toBe(
      'popup_html_new_age_keychain',
    );
  });

  it('replaces Chrome-style numbered placeholders', () => {
    chrome.i18n.getUILanguage = jest.fn().mockReturnValue('en-US');

    expect(
      I18nUtils.getMessage('popup_html_transfer_recurrence_value', ['40', '5']),
    ).toBe('Every 40 hours, 5 times');
  });

  it('replaces Chrome-style named placeholders using their numbered content', () => {
    chrome.i18n.getUILanguage = jest.fn().mockReturnValue('en-US');

    expect(
      I18nUtils.getMessage('evm_switch_chain_caption', ['app.example.com']),
    ).toBe('app.example.com wants to use a different chain with your wallet.');
  });

  it('returns the available language options from locale resources', () => {
    expect(I18nUtils.getLanguageOptions().map((option) => option.value)).toEqual(
      ['de', 'en', 'es', 'fr', 'id', 'pt', 'zh-CN', 'zh-TW'],
    );
  });

  it('uses the saved language preference before the system language', async () => {
    chrome.i18n.getUILanguage = jest.fn().mockReturnValue('es-MX');
    getValueFromLocalStorageMock.mockResolvedValue('pt-BR');

    await expect(I18nUtils.initLanguageFromStorage()).resolves.toBe('pt');

    expect(I18nUtils.getCurrentLanguage()).toBe('pt');
  });

  it('uses the system language when no saved preference exists', async () => {
    chrome.i18n.getUILanguage = jest.fn().mockReturnValue('es-MX');

    await expect(I18nUtils.getSavedOrDefaultLanguage()).resolves.toBe('es');
  });

  it('uses English when the system language is unavailable', async () => {
    chrome.i18n.getUILanguage = jest.fn().mockReturnValue('sv-SE');

    await expect(I18nUtils.getSavedOrDefaultLanguage()).resolves.toBe('en');
  });

  it('saves the selected language preference using supported locale fallback', async () => {
    await expect(I18nUtils.saveLanguage('pt-BR')).resolves.toBe('pt');

    expect(saveValueInLocalStorageMock).toHaveBeenCalledWith(
      LocalStorageKeyEnum.ACTIVE_LANGUAGE,
      'pt',
    );
  });
});
