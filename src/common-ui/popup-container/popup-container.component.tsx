import React from 'react';

interface PopupContainerProps {
  children: any;
  className?: string;
}

export const PopupContainer = ({
  children,
  className,
}: PopupContainerProps) => {
  return (
    <div className={`popup-container ${className}`}>
      <div className="overlay"></div>
      <div className="popup-content">{children}</div>
    </div>
  );
};
