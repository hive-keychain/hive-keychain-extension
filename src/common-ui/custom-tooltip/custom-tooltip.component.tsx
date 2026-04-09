import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
  left: number;
  top: number;
  placement: CustomTooltipPosition;
  arrowOffsetX?: number;
  arrowOffsetY?: number;
}

const TOOLTIP_ARROW_SIZE = 6;
const TOOLTIP_GAP = TOOLTIP_ARROW_SIZE + 2;
const TOOLTIP_VIEWPORT_PADDING = 8;
const TOOLTIP_BORDER_RADIUS = 4;

const clampValue = (value: number, min: number, max: number) => {
  const boundedMax = Math.max(min, max);
  return Math.min(Math.max(value, min), boundedMax);
};

const getOppositePlacement = (
  placement: CustomTooltipPosition,
): CustomTooltipPosition => {
  switch (placement) {
    case 'bottom':
      return 'top';
    case 'left':
      return 'right';
    case 'right':
      return 'left';
    case 'top':
    default:
      return 'bottom';
  }
};

const hasRoomForPlacement = (
  placement: CustomTooltipPosition,
  anchorRect: DOMRect,
  tooltipRect: DOMRect,
  viewportWidth: number,
  viewportHeight: number,
) => {
  switch (placement) {
    case 'bottom':
      return (
        anchorRect.bottom + TOOLTIP_GAP + tooltipRect.height <=
        viewportHeight - TOOLTIP_VIEWPORT_PADDING
      );
    case 'left':
      return (
        anchorRect.left - TOOLTIP_GAP - tooltipRect.width >=
        TOOLTIP_VIEWPORT_PADDING
      );
    case 'right':
      return (
        anchorRect.right + TOOLTIP_GAP + tooltipRect.width <=
        viewportWidth - TOOLTIP_VIEWPORT_PADDING
      );
    case 'top':
    default:
      return (
        anchorRect.top - TOOLTIP_GAP - tooltipRect.height >=
        TOOLTIP_VIEWPORT_PADDING
      );
  }
};

const getTooltipCoordinates = (
  preferredPlacement: CustomTooltipPosition,
  anchorRect: DOMRect,
  tooltipRect: DOMRect,
  viewportWidth: number,
  viewportHeight: number,
): TooltipCoordinates => {
  const fallbackPlacement = getOppositePlacement(preferredPlacement);
  const placement = hasRoomForPlacement(
    preferredPlacement,
    anchorRect,
    tooltipRect,
    viewportWidth,
    viewportHeight,
  )
    ? preferredPlacement
    : hasRoomForPlacement(
        fallbackPlacement,
        anchorRect,
        tooltipRect,
        viewportWidth,
        viewportHeight,
      )
    ? fallbackPlacement
    : preferredPlacement;

  let left = 0;
  let top = 0;

  switch (placement) {
    case 'bottom':
      left = anchorRect.left + anchorRect.width / 2 - tooltipRect.width / 2;
      top = anchorRect.bottom + TOOLTIP_GAP;
      break;
    case 'left':
      left = anchorRect.left - tooltipRect.width - TOOLTIP_GAP;
      top = anchorRect.top + anchorRect.height / 2 - tooltipRect.height / 2;
      break;
    case 'right':
      left = anchorRect.right + TOOLTIP_GAP;
      top = anchorRect.top + anchorRect.height / 2 - tooltipRect.height / 2;
      break;
    case 'top':
    default:
      left = anchorRect.left + anchorRect.width / 2 - tooltipRect.width / 2;
      top = anchorRect.top - tooltipRect.height - TOOLTIP_GAP;
      break;
  }

  left = clampValue(
    left,
    TOOLTIP_VIEWPORT_PADDING,
    viewportWidth - tooltipRect.width - TOOLTIP_VIEWPORT_PADDING,
  );
  top = clampValue(
    top,
    TOOLTIP_VIEWPORT_PADDING,
    viewportHeight - tooltipRect.height - TOOLTIP_VIEWPORT_PADDING,
  );

  const arrowOffsetX = clampValue(
    anchorRect.left + anchorRect.width / 2 - left - TOOLTIP_ARROW_SIZE,
    TOOLTIP_BORDER_RADIUS,
    tooltipRect.width - 2 * TOOLTIP_ARROW_SIZE - TOOLTIP_BORDER_RADIUS,
  );
  const arrowOffsetY = clampValue(
    anchorRect.top + anchorRect.height / 2 - top - TOOLTIP_ARROW_SIZE,
    TOOLTIP_BORDER_RADIUS,
    tooltipRect.height - 2 * TOOLTIP_ARROW_SIZE - TOOLTIP_BORDER_RADIUS,
  );

  return {
    left,
    top,
    placement,
    arrowOffsetX:
      placement === 'top' || placement === 'bottom' ? arrowOffsetX : undefined,
    arrowOffsetY:
      placement === 'left' || placement === 'right' ? arrowOffsetY : undefined,
  };
};

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
  const preferredPlacement = position ?? 'top';
  const anchor = useRef<HTMLDivElement>(null);
  const tooltip = useRef<HTMLDivElement>(null);
  const isHoverRef = useRef(false);
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isHover, setIsHover] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [coordinates, setCoordinates] = useState<TooltipCoordinates>();

  // Keep ref in sync so timeout callback reads current hover state (avoids stale closure)
  isHoverRef.current = isHover;

  const clearShowTimeout = () => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
  };

  const clearHideTimeout = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearShowTimeout();
      clearHideTimeout();
    };
  }, []);

  useLayoutEffect(() => {
    if (!isOpen || !message) return;

    const anchorRect = anchor.current?.getBoundingClientRect();
    const tooltipRect = tooltip.current?.getBoundingClientRect();

    if (!anchorRect || !tooltipRect) return;

    setCoordinates(
      getTooltipCoordinates(
        preferredPlacement,
        anchorRect,
        tooltipRect,
        window.innerWidth,
        window.innerHeight,
      ),
    );
  }, [customKey, isOpen, message, messageParams, preferredPlacement, skipTranslation]);

  useEffect(() => {
    if (!isOpen || !message) return;

    const updateTooltipCoordinates = () => {
      const anchorRect = anchor.current?.getBoundingClientRect();
      const tooltipRect = tooltip.current?.getBoundingClientRect();

      if (!anchorRect || !tooltipRect) return;

      setCoordinates(
        getTooltipCoordinates(
          preferredPlacement,
          anchorRect,
          tooltipRect,
          window.innerWidth,
          window.innerHeight,
        ),
      );
    };

    window.addEventListener('resize', updateTooltipCoordinates);
    window.addEventListener('scroll', updateTooltipCoordinates, true);

    return () => {
      window.removeEventListener('resize', updateTooltipCoordinates);
      window.removeEventListener('scroll', updateTooltipCoordinates, true);
    };
  }, [customKey, isOpen, message, messageParams, preferredPlacement, skipTranslation]);

  const show = () => {
    clearHideTimeout();
    clearShowTimeout();

    showTimeoutRef.current = setTimeout(
      () => {
        showTimeoutRef.current = null;
        if (isHoverRef.current) {
          setCoordinates(undefined);
          setOpen(true);
        }
      },
      delayShow ? delayShow : 250,
    );
  };

  const hide = () => {
    clearShowTimeout();
    clearHideTimeout();
    hideTimeoutRef.current = setTimeout(() => {
      hideTimeoutRef.current = null;
      setOpen(false);
      setCoordinates(undefined);
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

  const tooltipStyle: React.CSSProperties & Record<string, string | number> = {
    position: 'fixed',
    top: coordinates?.top ?? 0,
    left: coordinates?.left ?? 0,
    visibility: coordinates ? 'visible' : 'hidden',
  };

  if (coordinates?.arrowOffsetX !== undefined) {
    tooltipStyle['--tooltip-arrow-offset-x'] = `${coordinates.arrowOffsetX}px`;
  }

  if (coordinates?.arrowOffsetY !== undefined) {
    tooltipStyle['--tooltip-arrow-offset-y'] = `${coordinates.arrowOffsetY}px`;
  }

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

      {isOpen && message && (
        <div
          ref={tooltip}
          data-testid="tooltip-content"
          className={`tooltip ${coordinates?.placement ?? preferredPlacement} ${
            color ? color : ''
          }`}
          style={tooltipStyle}>
          <div
            className="tooltip-inner"
            dangerouslySetInnerHTML={{
              __html: sanitizeHTML(
                skipTranslation
                  ? message
                  : chrome.i18n.getMessage(message, messageParams),
                { allowedTags: ['b', 'br', 'i', 'p', 'span', 'div'] },
              ),
            }}></div>
        </div>
      )}
    </div>
  );
};
