import React from 'react';

interface PopupContainerProps {
  children: any;
  className?: string;
  onClickOutside?: () => void;
}

export const PopupContainer = ({
  children,
  className,
  onClickOutside,
}: PopupContainerProps) => {
  return (
    <div className={`popup-container ${className}`}>
      <div
        className="overlay"
        onClick={() => {
          if (onClickOutside) onClickOutside();
        }}></div>
      <div className="popup-content">{children}</div>
    </div>
  );
};
