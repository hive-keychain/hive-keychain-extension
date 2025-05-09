import React, { BaseSyntheticEvent, useState } from 'react';
import { ReactSVG } from 'react-svg';
import {
  CustomTooltip,
  TooltipProps,
} from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { SVGIcons } from 'src/common-ui/icons.enum';

interface ISVGIconProps {
  dataTestId?: string;
  onClick?: (...params: any) => void;
  className?: string;
  icon: SVGIcons;
  hoverable?: boolean;
  forceHover?: boolean;
  skipTooltipTranslation?: boolean;
  tooltipMessage?: string;
  tooltipPosition?: TooltipProps['position'];
  tooltipDelayShow?: number;
  background?: string;
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
  }: ISVGIconProps) => {
    return (
      <ReactSVG
        data-testid={dataTestId}
        onMouseOver={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={($event) => {
          handleClick($event);
        }}
        className={`svg-icon ${className ?? ''} ${onClick ? 'clickable' : ''} ${
          (hoverable && hovered) || forceHover ? 'hovered' : ''
        }`}
        src={`/assets/images/${icon}.svg`}
        style={{ background: background }}
      />
    );
  };

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
    });
  }
};
