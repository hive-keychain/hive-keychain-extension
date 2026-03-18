import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import {
  NOTIFICATION_LINK_PLACEHOLDER,
  renderLocalizedNotificationMessage,
} from 'src/popup/hive/pages/app-container/home/notifications/notification-message.utils';

const renderMessage = (message: string, linkLabel?: string) =>
  render(
    <div data-testid="message">
      {renderLocalizedNotificationMessage(
        message,
        linkLabel ? (
          <a href="https://example.com/post" target="_blank" rel="noreferrer">
            {linkLabel}
          </a>
        ) : undefined,
      )}
    </div>,
  );

describe('notification-message.utils', () => {
  it('renders a link inside the localized notification message', () => {
    renderMessage(
      `Before ${NOTIFICATION_LINK_PLACEHOLDER} after`,
      '@alice/my-post',
    );

    expect(
      screen.getByRole('link', { name: '@alice/my-post' }),
    ).toHaveAttribute('href', 'https://example.com/post');
    expect(screen.getByTestId('message')).toHaveTextContent(
      'Before @alice/my-post after',
    );
  });

  it('supports link placement that varies by locale', () => {
    const { rerender } = render(
      <div data-testid="message">
        {renderLocalizedNotificationMessage(
          `${NOTIFICATION_LINK_PLACEHOLDER} depois`,
          <a href="https://example.com/post">link</a>,
        )}
      </div>,
    );

    expect(screen.getByTestId('message')).toHaveTextContent('link depois');

    rerender(
      <div data-testid="message">
        {renderLocalizedNotificationMessage(
          `antes ${NOTIFICATION_LINK_PLACEHOLDER}`,
          <a href="https://example.com/post">link</a>,
        )}
      </div>,
    );

    expect(screen.getByTestId('message')).toHaveTextContent('antes link');
  });

  it('renders untrusted notification params as text instead of HTML', () => {
    const maliciousMessage = `<img src=x onerror="alert('xss')">`;
    const maliciousLinkLabel = `<script>alert('xss')</script>`;
    const { container } = renderMessage(
      `${maliciousMessage} ${NOTIFICATION_LINK_PLACEHOLDER}`,
      maliciousLinkLabel,
    );

    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(container.querySelector('script')).not.toBeInTheDocument();
    expect(screen.getByTestId('message')).toHaveTextContent(maliciousMessage);
    expect(
      screen.getByRole('link', { name: maliciousLinkLabel }),
    ).toBeInTheDocument();
  });

  it('renders plain text notifications without a link', () => {
    renderMessage('@alice followed @bob');

    expect(screen.getByTestId('message')).toHaveTextContent(
      '@alice followed @bob',
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('fails safely when the link placeholder is missing', () => {
    const rawHtmlMessage = `Fallback <a href="https://evil.test">evil</a>`;
    const { container } = renderMessage(rawHtmlMessage, 'ignored');

    expect(container.querySelector('a')).not.toBeInTheDocument();
    expect(screen.getByTestId('message')).toHaveTextContent(rawHtmlMessage);
  });
});
