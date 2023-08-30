import React, { useEffect, useRef, useState } from 'react';
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

interface TooltipCoordinates {
  x: number;
  y: number;
}

const TOOLTIP_WIDTH = 150;
const TOOLTIP_PADDING = 12;
const TOOLTIP_ARROW_SIZE = 6;

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
  const anchor = useRef<HTMLDivElement>(null);
  const tooltip = useRef<HTMLDivElement>(null);

  const [isOpen, setOpen] = useState(false);
  let timeout: NodeJS.Timeout;
  let [coordinates, setCoordinates] = useState<TooltipCoordinates>();

  useEffect(() => {
    if (isOpen && (!position || position === 'top')) {
      const divInfo = anchor.current?.getBoundingClientRect();
      const tooltipInfo = tooltip.current?.getBoundingClientRect();
      if (divInfo && tooltipInfo) {
        setCoordinates({
          x: divInfo.left + divInfo.width / 2 - TOOLTIP_ARROW_SIZE,
          y: divInfo.top - tooltipInfo.height - TOOLTIP_ARROW_SIZE - 2,
        });
      }
    }
  }, [isOpen]);

  const show = () => {
    const divInfo = anchor.current?.getBoundingClientRect();

    if (!divInfo) return;

    switch (position) {
      case 'left': {
        setCoordinates({
          x:
            divInfo.left -
            TOOLTIP_WIDTH -
            2 * TOOLTIP_PADDING -
            TOOLTIP_ARROW_SIZE -
            2,
          y: divInfo.top + divInfo.height / 2,
        });
        break;
      }
      case 'right': {
        setCoordinates({
          x: divInfo.left + divInfo.width + TOOLTIP_ARROW_SIZE + 2,
          y: divInfo.top + divInfo.height / 2,
        });
        break;
      }
      case 'bottom': {
        setCoordinates({
          x: divInfo.left + divInfo.width / 2 - TOOLTIP_ARROW_SIZE,
          y: divInfo.top + divInfo.height + TOOLTIP_ARROW_SIZE,
        });
        break;
      }
      case 'top':
      default: {
        setCoordinates({
          x: divInfo.left + divInfo.width / 2,
          y: divInfo.top,
        });
        break;
      }
    }

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
    <div
      data-testid={dataTestId}
      className={`tooltip-container ${additionalClassName}`}
      onMouseEnter={show}
      onMouseLeave={hide}>
      <div className="tooltip-anchor" ref={anchor}>
        {children}
      </div>

      {isOpen && message && coordinates && (
        <div
          ref={tooltip}
          data-testid="tooltip-content"
          className={`tooltip ${position ? position : 'top'}`}
          style={{
            position: 'fixed',
            top: coordinates.y,
            left: coordinates.x,
          }}
          dangerouslySetInnerHTML={{
            __html: skipTranslation
              ? message
              : chrome.i18n.getMessage(message, messageParams),
          }}></div>
      )}

      {/* <div
        style={{
          width: 4,
          height: 4,
          background: 'blue',
          position: 'fixed',
          top: left.y,
          left: left.x,
        }}></div>
      <div
        style={{
          width: 4,
          height: 4,
          background: 'blue',
          position: 'fixed',
          top: right.y,
          left: right.x,
        }}></div>
      <div
        style={{
          width: 4,
          height: 4,
          background: 'blue',
          position: 'fixed',
          top: top.y,
          left: top.x,
        }}></div>
      <div
        style={{
          width: 4,
          height: 4,
          background: 'blue',
          position: 'fixed',
          top: bottom.y,
          left: bottom.x,
        }}></div> */}
    </div>
  );
};
