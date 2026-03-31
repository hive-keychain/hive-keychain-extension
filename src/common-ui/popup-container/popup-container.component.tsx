import React from 'react';

interface PopupContainerProps {
  children: any;
  className?: string;
  /** Optional anchor for tests / a11y when a single popup root must be queryable. */
  dataTestId?: string;
}

export const PopupContainer = ({
  children,
  className,
  dataTestId,
}: PopupContainerProps) => {
  return (
    <div data-testid={dataTestId} className={`popup-container ${className}`}>
      <div className="overlay"></div>
      <div className="popup-content">{children}</div>
    </div>
  );
};
