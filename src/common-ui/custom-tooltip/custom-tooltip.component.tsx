import React, { useEffect, useRef, useState } from 'react';
import sanitizeHTML from 'sanitize-html';

export type CustomTooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export interface TooltipProps {
  position?: CustomTooltipPosition;
  delayShow?: number;
  children: any;
  message?: string;
  messageParams?: any;
  skipTranslation?: boolean;
  dataTestId?: string;
  additionalClassName?: string;
  color?: 'white' | 'grey';
  customKey?: any;
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
  color,
  customKey,
}: TooltipProps) => {
  const anchor = useRef<HTMLDivElement>(null);
  const tooltip = useRef<HTMLDivElement>(null);

  const [isHover, setIsHover] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [timeout, setTimeoutId] = useState<NodeJS.Timeout>();
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

    let timeoutId = setTimeout(
      () => {
        if (isHover) setOpen(true);
      },
      delayShow ? delayShow : 250,
    );
    setTimeoutId(timeoutId);
  };

  const hide = () => {
    clearTimeout(timeout);
    setTimeout(() => {
      setOpen(false);
    }, 250);
  };

  const handleMouseEnter = () => {
    setIsHover(true);
    show();
  };

  const handleMouseLeave = () => {
    setIsHover(false);
    hide();
  };

  return (
    <div
      data-testid={dataTestId}
      className={`tooltip-container ${additionalClassName}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      key={customKey?.toString()}>
      <div className="tooltip-anchor" ref={anchor}>
        {children}
      </div>

      {isOpen && message && coordinates && (
        <div
          ref={tooltip}
          data-testid="tooltip-content"
          className={`tooltip ${position ? position : 'top'} ${
            color ? color : ''
          }`}
          style={{
            position: 'fixed',
            top: coordinates.y,
            left: coordinates.x,
          }}
          dangerouslySetInnerHTML={{
            __html: sanitizeHTML(
              skipTranslation
                ? message
                : chrome.i18n.getMessage(message, messageParams),
              { allowedTags: ['b', 'br', 'i', 'p', 'span', 'div'] },
            ),
          }}></div>
      )}
    </div>
  );
};
