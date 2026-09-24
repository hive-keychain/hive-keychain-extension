import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  titleId: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  logo?: React.ReactNode;
  headerAction?: React.ReactNode;
  dataTestId?: string;
}

const getFocusableElements = (container: HTMLElement) =>
  Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
    ),
  );

const getThemePortalRoot = (): HTMLElement =>
  document.querySelector<HTMLElement>('#root .theme') ?? document.body;

export const WalletTokenDetailPanel = ({
  isOpen,
  onClose,
  title,
  titleId,
  children,
  footer,
  logo,
  headerAction,
  dataTestId = 'wallet-token-detail-panel',
}: Props) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previouslyFocusedElementRef.current =
      document.activeElement as HTMLElement | null;

    const animationFrame = requestAnimationFrame(() => {
      const firstElement = cardRef.current
        ? getFocusableElements(cardRef.current)[0]
        : undefined;
      (firstElement ?? cardRef.current)?.focus();
    });

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      cancelAnimationFrame(animationFrame);
      document.removeEventListener('keydown', handleEscape);
      previouslyFocusedElementRef.current?.focus();
    };
  }, [isOpen]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key !== 'Tab' || !cardRef.current) {
      return;
    }

    const focusableElements = getFocusableElements(cardRef.current);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement?.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement?.focus();
    }
  };

  if (!isOpen) {
    return null;
  }

  // Portal into `#root .theme` so sidepanel/detached-window CSS matches the
  // account selector overlay (same frame width), while escaping the token row.
  return createPortal(
    <div
      className="wallet-token-detail-panel-overlay"
      data-testid={`${dataTestId}-overlay`}
      onKeyDown={handleKeyDown}>
      <div
        className="wallet-token-detail-panel-backdrop"
        data-testid={`${dataTestId}-backdrop`}
        onClick={onClose}
      />
      <div
        id={titleId}
        ref={cardRef}
        className="wallet-token-detail-panel-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${titleId}-title`}
        data-testid={dataTestId}
        tabIndex={-1}>
        <div className="wallet-token-detail-panel-header">
          <div className="wallet-token-detail-panel-identity">
            {logo && (
              <div
                className="wallet-token-detail-panel-logo"
                data-testid={`${dataTestId}-logo`}>
                {logo}
              </div>
            )}
            <div
              id={`${titleId}-title`}
              className="wallet-token-detail-panel-title">
              {title}
            </div>
          </div>
          {headerAction}
        </div>
        <div className="wallet-token-detail-panel-content">{children}</div>
        {footer && (
          <div
            className="wallet-token-detail-panel-footer"
            data-testid={`${dataTestId}-footer`}>
            {footer}
          </div>
        )}
      </div>
    </div>,
    getThemePortalRoot(),
  );
};
