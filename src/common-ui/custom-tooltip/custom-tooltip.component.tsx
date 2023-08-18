import React, { useState } from 'react';
import './custom-tooltip.component.scss';

export type CustomTooltipPosition = 'top' | 'bottom' | 'left' | 'right';
interface TooltipProps {
  position?: CustomTooltipPosition;
  delayShow?: number;
  children: any;
  message?: string;
  messageParams?: any;
  skipTranslation?: boolean;
  dataTestId?: string;
  additionalClassName?: string;
}

export const CustomTooltip = ({
  position,
  delayShow,
  message,
  messageParams,
  skipTranslation,
  children,
  dataTestId,
  additionalClassName,
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
  console.log('p', position, message);
  return (
    <div
      data-testid={dataTestId}
      className={`tooltip-container ${additionalClassName}`}
      onMouseEnter={show}
      onMouseLeave={hide}>
      <div className="tooltip-anchor">{children}</div>
      {isOpen && message && (
        <div
          data-testid="tooltip-content"
          className={`tooltip ${position ? position : 'top'}`}
          dangerouslySetInnerHTML={{
            __html: skipTranslation
              ? message
              : chrome.i18n.getMessage(message, messageParams),
          }}></div>
      )}
    </div>
  );
};
