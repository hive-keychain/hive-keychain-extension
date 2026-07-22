import { Theme, useThemeContext } from '@popup/theme.context';
import React from 'react';
import { createPortal } from 'react-dom';

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
      ...containerProps
    },
    ref,
  ) => {
    const { theme: contextTheme } = useThemeContext();
    const portalTheme = contextTheme ?? Theme.DARK;

    const popup = (
      <div
        {...containerProps}
        ref={ref}
        data-testid={dataTestId ?? dataTestIdAttr}
        className={`popup-container ${className ?? ''}`}>
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
