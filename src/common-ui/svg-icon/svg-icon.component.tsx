import React, { useCallback, useState } from 'react';
import { ReactSVG } from 'react-svg';
import {
  CustomTooltip,
  TooltipProps,
} from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { I18nUtils } from 'src/utils/i18n.utils';

interface ISVGIconProps {
  dataTestId?: string;
  onClick?: (...params: any) => void;
  ariaLabel?: string;
  className?: string;
  icon: SVGIcons;
  hoverable?: boolean;
  forceHover?: boolean;
  skipTooltipTranslation?: boolean;
  tooltipMessage?: string;
  tooltipPosition?: TooltipProps['position'];
  tooltipDelayShow?: number;
  background?: string;
  svgViewBox?: string;
}

export const SVGIcon = ({
  dataTestId,
  onClick,
  className,
  icon,
  hoverable,
  forceHover,
  skipTooltipTranslation,
  tooltipMessage,
  tooltipPosition,
  tooltipDelayShow,
  background,
  svgViewBox,
  ariaLabel,
}: ISVGIconProps) => {
  const [hovered, setHovered] = useState(false);
  const isClickable = Boolean(onClick);
  const applyViewBox = useCallback(
    (svg: SVGSVGElement) => {
      if (svgViewBox) {
        svg.setAttribute('viewBox', svgViewBox);
      }
    },
    [svgViewBox],
  );

  const handleClick = (event: React.SyntheticEvent) => {
    onClick?.(event);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!onClick || (event.key !== 'Enter' && event.key !== ' ')) {
      return;
    }
    event.preventDefault();
    handleClick(event);
  };

  const accessibleLabel =
    ariaLabel ??
    (tooltipMessage
      ? skipTooltipTranslation
        ? tooltipMessage
        : I18nUtils.getMessage(tooltipMessage)
      : undefined);

  const iconElement = (
    <div
      data-testid={dataTestId}
      className={`svg-icon ${className ?? ''} ${isClickable ? 'clickable' : ''} ${
        (hoverable && hovered) || forceHover ? 'hovered' : ''
      }`}
      style={background ? { background } : undefined}
      onMouseOver={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={isClickable ? handleClick : undefined}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={isClickable ? accessibleLabel : undefined}>
      <ReactSVG
        src={`/assets/images/${icon}.svg`}
        afterInjection={svgViewBox ? applyViewBox : undefined}
      />
    </div>
  );

  if (tooltipMessage && tooltipPosition) {
    return (
      <CustomTooltip
        message={tooltipMessage}
        position={tooltipPosition}
        delayShow={tooltipDelayShow ?? 500}
        skipTranslation={skipTooltipTranslation}>
        {iconElement}
      </CustomTooltip>
    );
  }

  return iconElement;
};
