import React, { useState } from 'react';
import './custom-tooltip.component.scss';

export type CustomTooltipPosition = 'top' | 'bottom' | 'left' | 'right';
interface TooltipProps {
  position?: CustomTooltipPosition;
  delayShow?: number;
  children: any;
  message?: string;
  skipTranslation?: boolean;
}

export const CustomTooltip = ({
  position,
  delayShow,
  message,
  skipTranslation,
  children,
}: TooltipProps) => {
  const [isOpen, setOpen] = useState(false);
  let timeout: NodeJS.Timeout;

  const show = () => {
    timeout = setTimeout(
      () => {
        setOpen(true);
      },
      delayShow ? delayShow : 0,
    );
  };

  const hide = () => {
    clearTimeout(timeout);
    setOpen(false);
  };

  return (
    <div className="tooltip-container" onMouseEnter={show} onMouseLeave={hide}>
      <div className="tooltip-anchor">{children}</div>
      {isOpen && message && (
        <div
          className={`tooltip ${position ? position : 'top'}`}
          dangerouslySetInnerHTML={{
            __html: skipTranslation ? message : chrome.i18n.getMessage(message),
          }}></div>
      )}
    </div>
  );
};
