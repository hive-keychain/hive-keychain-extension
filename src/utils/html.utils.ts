import sanitizeHTML from 'sanitize-html';
import { I18nUtils } from 'src/utils/i18n.utils';

const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const BASE_ALLOWED_TAGS = ['b', 'br', 'i', 'p', 'span', 'div'];
const LIST_ALLOWED_TAGS = ['ul', 'li'];

const LINK_ENABLED_I18N_KEYS = new Set([
  'accept_terms_and_condition',
  'ledger_import_account_has_ledger',
  'popup_html_about_text',
  'popup_html_multisig_intro',
  'popup_html_setup_text',
  'popup_html_tokens_settings_text',
  'popup_html_vesting_routes_warning_message',
]);

const LIST_ENABLED_I18N_KEYS = new Set(['popup_html_about_text']);

const TERMS_URL = 'https://hive-keychain.com/#/terms';
const PRIVACY_URL = 'https://hive-keychain.com/#/privacy';
const TERMS_AND_PRIVACY_I18N_KEY = 'accept_terms_and_condition';

interface SanitizeHtmlOptions {
  allowLinks?: boolean;
  allowLists?: boolean;
}

type HtmlMessageParam = string | number | boolean | null | undefined;

const escapeHtml = (value: unknown) =>
  String(value ?? '').replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char]);

const escapeHtmlParams = (
  params?: HtmlMessageParam | HtmlMessageParam[],
): string | string[] | undefined => {
  if (Array.isArray(params)) {
    return params.map((param) => escapeHtml(param));
  }

  if (params === undefined) {
    return undefined;
  }

  return escapeHtml(params);
};

const sanitizeHtml = (html: string, options?: SanitizeHtmlOptions) => {
  return sanitizeHTML(html, {
    allowedTags: [
      ...BASE_ALLOWED_TAGS,
      ...(options?.allowLists ? LIST_ALLOWED_TAGS : []),
      ...(options?.allowLinks ? ['a'] : []),
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      div: ['class'],
      li: ['class'],
      p: ['class'],
      span: ['class'],
      ul: ['class'],
    },
    allowedSchemes: ['chrome-extension', 'http', 'https', 'mailto'],
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          ...(attribs.target ? { rel: 'noopener noreferrer' } : {}),
        },
      }),
    },
  });
};

const getTermsAndPrivacyHtml = (html: string) =>
  html
    .replaceAll(
      TERMS_URL,
      escapeHtml(process.env.KEYCHAIN_TERMS_URL || TERMS_URL),
    )
    .replaceAll(
      PRIVACY_URL,
      escapeHtml(process.env.KEYCHAIN_PRIVACY_URL || PRIVACY_URL),
    );

const getI18nHtml = (
  message: string,
  params?: HtmlMessageParam | HtmlMessageParam[],
) => {
  const html = I18nUtils.getMessage(message, escapeHtmlParams(params));

  if (message === TERMS_AND_PRIVACY_I18N_KEY) {
    return getTermsAndPrivacyHtml(html);
  }

  return html;
};

const getSafeI18nHtml = (
  message: string,
  params?: HtmlMessageParam | HtmlMessageParam[],
) =>
  sanitizeHtml(getI18nHtml(message, params), {
    allowLinks: LINK_ENABLED_I18N_KEYS.has(message),
    allowLists: LIST_ENABLED_I18N_KEYS.has(message),
  });

export const HtmlUtils = {
  escapeHtml,
  escapeHtmlParams,
  sanitizeHtml,
  getSafeI18nHtml,
};
