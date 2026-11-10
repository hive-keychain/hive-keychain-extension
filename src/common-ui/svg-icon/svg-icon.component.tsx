import React, { BaseSyntheticEvent, useState } from 'react';
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
  svgViewBox,
  ariaLabel,
}: ISVGIconProps) => {
  const [hovered, setHovered] = useState(false);

  const handleClick = (event: BaseSyntheticEvent) => {
    if (onClick) {
      onClick(event);
    }
  };

  const getIconTemplate = ({
    dataTestId,
    onClick,
    className,
    icon,
    hoverable,
    forceHover,
    background,
    svgViewBox,
    ariaLabel,
  }: ISVGIconProps) => {
    return (
      <ReactSVG
        data-testid={dataTestId}
        onMouseOver={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={($event) => {
          handleClick($event);
        }}
        onKeyDown={(event) => {
          if (!onClick || (event.key !== 'Enter' && event.key !== ' ')) return;
          event.preventDefault();
          handleClick(event);
        }}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={onClick ? ariaLabel : undefined}
        className={`svg-icon ${className ?? ''} ${onClick ? 'clickable' : ''} ${
          (hoverable && hovered) || forceHover ? 'hovered' : ''
        }`}
        src={`/assets/images/${icon}.svg`}
        style={{ background: background }}
        afterInjection={(svg) => {
          if (svgViewBox) {
            svg.setAttribute('viewBox', svgViewBox);
          }
        }}
      />
    );
  };

  const accessibleLabel =
    ariaLabel ??
    (tooltipMessage
      ? skipTooltipTranslation
        ? tooltipMessage
        : I18nUtils.getMessage(tooltipMessage)
      : undefined);

  if (tooltipMessage && tooltipPosition) {
    return (
      <CustomTooltip
        message={tooltipMessage}
        position={tooltipPosition}
        delayShow={tooltipDelayShow ?? 500}
        skipTranslation={skipTooltipTranslation}>
        {getIconTemplate({
          dataTestId,
          onClick,
          className,
          icon,
          hoverable,
          forceHover,
          svgViewBox,
          ariaLabel: accessibleLabel,
        })}
      </CustomTooltip>
    );
  } else {
    return getIconTemplate({
      dataTestId,
      onClick,
      className,
      icon,
      hoverable,
      forceHover,
      svgViewBox,
      ariaLabel: accessibleLabel,
    });
  }
};
