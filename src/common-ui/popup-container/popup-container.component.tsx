import { Theme, useThemeContext } from '@popup/theme.context';
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const getFocusableElements = (container: HTMLElement) =>
  Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
    ),
  );

interface PopupContainerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children: any;
  className?: string;
  onClickOutside?: () => void;
  showOverlay?: boolean;
  dataTestId?: string;
  'data-testid'?: string;
  /** Renders at document.body so position:fixed covers the real viewport (e.g. under transformed ancestors in the dialog). */
  useBodyPortal?: boolean;
  initialFocusSelector?: string;
  onEscape?: () => void;
}

export const PopupContainer = React.forwardRef<
  HTMLDivElement,
  PopupContainerProps
>(
  (
    {
      children,
      className,
      onClickOutside,
      showOverlay = true,
      dataTestId,
      'data-testid': dataTestIdAttr,
      useBodyPortal = false,
      initialFocusSelector,
      onEscape,
      onKeyDown,
      role,
      tabIndex,
      'aria-modal': ariaModal,
      ...containerProps
    },
    forwardedRef,
  ) => {
    const { theme: contextTheme } = useThemeContext();
    const portalTheme = contextTheme ?? Theme.DARK;
    const popupRef = useRef<HTMLDivElement | null>(null);
    const dialogRole = role ?? (showOverlay ? 'dialog' : undefined);
    const managesFocus = dialogRole === 'dialog';

    const setPopupRef = (element: HTMLDivElement | null) => {
      popupRef.current = element;
      if (typeof forwardedRef === 'function') {
        forwardedRef(element);
      } else if (forwardedRef) {
        forwardedRef.current = element;
      }
    };

    useEffect(() => {
      if (!managesFocus) return;

      const previouslyFocusedElement = document.activeElement as
        | HTMLElement
        | null;
      const animationFrame = requestAnimationFrame(() => {
        const initialFocusContainer = initialFocusSelector
          ? popupRef.current?.querySelector<HTMLElement>(initialFocusSelector)
          : popupRef.current;
        const firstElement = initialFocusContainer
          ? getFocusableElements(initialFocusContainer)[0]
          : undefined;
        (firstElement ?? popupRef.current)?.focus();
      });

      return () => {
        cancelAnimationFrame(animationFrame);
        previouslyFocusedElement?.focus();
      };
    }, [initialFocusSelector, managesFocus]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || !managesFocus) return;

      if (event.key === 'Escape') {
        const closePopup = onEscape ?? onClickOutside;
        if (closePopup) {
          event.preventDefault();
          closePopup();
        }
        return;
      }

      if (event.key !== 'Tab' || !popupRef.current) return;

      const focusableElements = getFocusableElements(popupRef.current);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement || !lastElement) {
        event.preventDefault();
        popupRef.current.focus();
      } else if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    const popup = (
      <div
        {...containerProps}
        ref={setPopupRef}
        data-testid={dataTestId ?? dataTestIdAttr}
        className={`popup-container ${className ?? ''}`}
        role={dialogRole}
        aria-modal={ariaModal ?? (dialogRole === 'dialog' ? true : undefined)}
        tabIndex={tabIndex ?? (managesFocus ? -1 : undefined)}
        onKeyDown={handleKeyDown}>
        {showOverlay && (
          <div
            className="overlay"
            onClick={() => {
              onClickOutside?.();
            }}></div>
        )}
        <div className="popup-content">{children}</div>
      </div>
    );

    if (useBodyPortal) {
      return createPortal(
        <div className={`theme ${portalTheme}`}>{popup}</div>,
        document.body,
      );
    }

    return popup;
  },
);

PopupContainer.displayName = 'PopupContainer';
