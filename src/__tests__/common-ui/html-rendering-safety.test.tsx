import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ResultMessagePageComponent } from 'src/common-ui/result-message-page/result-message-page.component';
import { HtmlUtils } from 'src/utils/html.utils';
import { I18nUtils } from 'src/utils/i18n.utils';

const env = process.env;

jest.mock('react-svg', () => ({
  ReactSVG: ({ src }: { src: string }) => (
    <span data-testid="svg-icon" data-src={src} />
  ),
}));

describe('HTML rendering safety', () => {
  beforeEach(() => {
    jest.spyOn(I18nUtils, 'getMessage').mockImplementation((message, params) => {
      if (message === 'message_container_close_button') {
        return 'Close';
      }

      if (message === 'safe_html_message') {
        return `Account @${params?.[0]}<br><b>needs review</b>`;
      }

      if (message === 'unsafe_link_message') {
        return '<a href="https://example.com">link</a>';
      }

      if (message === 'ledger_import_account_has_ledger') {
        return `Open <a href="${params?.[0]}" target="_blank" onclick="alert(1)">Ledger</a>`;
      }

      if (message === 'accept_terms_and_condition') {
        return "I agree to <a href='https://hive-keychain.com/#/terms'>Terms</a> and <a href='https://hive-keychain.com/#/privacy'>Privacy</a>";
      }

      return message;
    });
  });

  afterEach(() => {
    process.env = env;
    jest.restoreAllMocks();
  });

  it('renders dialog feedback locale keys with allowed tags only', () => {
    jest.spyOn(I18nUtils, 'getMessage').mockImplementation((message) => {
      if (message === 'bgd_ops_sign_success') {
        return 'Message signed successfully.<br>Done.';
      }
      return message;
    });

    const { container } = render(
      <ResultMessagePageComponent
        type="success"
        title="message_container_title_success"
        message="ignored"
        messageI18nKey="bgd_ops_sign_success"
        onClose={jest.fn()}
      />,
    );

    expect(container.querySelector('br')).toBeInTheDocument();
    expect(container).toHaveTextContent('Message signed successfully.');
    expect(container).toHaveTextContent('Done.');
  });

  it('renders skipped translation result messages as text', () => {
    const maliciousMessage =
      'Account @<img src=x onerror="alert(1)"> has not been added.';
    const { container } = render(
      <ResultMessagePageComponent
        type="error"
        title="message_container_title_fail"
        message={maliciousMessage}
        skipMessageTranslation
        onClose={jest.fn()}
      />,
    );

    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(screen.getByText(maliciousMessage)).toBeInTheDocument();
  });

  it('keeps allowed i18n markup while escaping substituted values', () => {
    const html = HtmlUtils.getSafeI18nHtml('safe_html_message', [
      '<img src=x onerror="alert(1)">',
    ]);
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;

    expect(wrapper.querySelector('img')).toBeNull();
    expect(wrapper.querySelector('br')).not.toBeNull();
    expect(wrapper.querySelector('b')).not.toBeNull();
    expect(wrapper).toHaveTextContent(
      'Account @<img src=x onerror="alert(1)">needs review',
    );
  });

  it('strips links from non-link allowlisted locale keys', () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = HtmlUtils.getSafeI18nHtml('unsafe_link_message');

    expect(wrapper.querySelector('a')).toBeNull();
    expect(wrapper).toHaveTextContent('link');
  });

  it('allows safe links only for link allowlisted locale keys', () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = HtmlUtils.getSafeI18nHtml(
      'ledger_import_account_has_ledger',
      ['chrome-extension://id/page.html'],
    );
    const links = wrapper.querySelectorAll('a');

    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute('href', 'chrome-extension://id/page.html');
    expect(links[0]).toHaveAttribute('rel', 'noopener noreferrer');
    expect(links[0]).not.toHaveAttribute('onclick');
  });

  it('strips unsafe hrefs from link allowlisted locale keys', () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = HtmlUtils.getSafeI18nHtml(
      'ledger_import_account_has_ledger',
      ['javascript:alert(1)'],
    );
    const link = wrapper.querySelector('a');

    expect(link).not.toBeNull();
    expect(link).not.toHaveAttribute('href');
    expect(link).not.toHaveAttribute('onclick');
  });

  it('keeps default terms and privacy links without env overrides', () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = HtmlUtils.getSafeI18nHtml('accept_terms_and_condition');
    const links = wrapper.querySelectorAll('a');

    expect(links[0]).toHaveAttribute(
      'href',
      'https://hive-keychain.com/#/terms',
    );
    expect(links[1]).toHaveAttribute(
      'href',
      'https://hive-keychain.com/#/privacy',
    );
  });

  it('uses env overrides for terms and privacy links', () => {
    process.env = {
      ...env,
      KEYCHAIN_PRIVACY_URL: 'https://example.com/privacy',
      KEYCHAIN_TERMS_URL: 'https://example.com/terms',
    };

    const wrapper = document.createElement('div');
    wrapper.innerHTML = HtmlUtils.getSafeI18nHtml('accept_terms_and_condition');
    const links = wrapper.querySelectorAll('a');

    expect(links[0]).toHaveAttribute('href', 'https://example.com/terms');
    expect(links[1]).toHaveAttribute('href', 'https://example.com/privacy');
  });

  it('sanitizes env overrides for terms and privacy links', () => {
    process.env = {
      ...env,
      KEYCHAIN_PRIVACY_URL: 'javascript:alert(1)',
      KEYCHAIN_TERMS_URL: 'javascript:alert(1)',
    };

    const wrapper = document.createElement('div');
    wrapper.innerHTML = HtmlUtils.getSafeI18nHtml('accept_terms_and_condition');
    const links = wrapper.querySelectorAll('a');

    expect(links[0]).not.toHaveAttribute('href');
    expect(links[1]).not.toHaveAttribute('href');
  });
});
