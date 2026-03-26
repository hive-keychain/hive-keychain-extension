import React from 'react';

interface PopupContainerProps {
  children: any;
  className?: string;
  onClickOutside?: () => void;
  dataTestId?: string;
  'data-testid'?: string;
}

export const PopupContainer = ({
  children,
  className,
  onClickOutside,
  dataTestId,
  'data-testid': dataTestIdAttr,
}: PopupContainerProps) => {
  return (
    <div
      data-testid={dataTestId ?? dataTestIdAttr}
      className={`popup-container ${className ?? ''}`}>
      <div
        className="overlay"
        onClick={() => {
          onClickOutside?.();
        }}></div>
      <div className="popup-content">{children}</div>
    </div>
  );
};
