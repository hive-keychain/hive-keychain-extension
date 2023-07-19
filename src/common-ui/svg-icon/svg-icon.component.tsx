import React, { BaseSyntheticEvent, useState } from 'react';
import { NewIcons } from 'src/common-ui/icons.enum';
import './svg-icon.component.scss';

interface ISVGIconProps {
  dataTestId?: string;
  onClick?: (...params: any) => void;
  className?: string;
  icon: NewIcons;
  hoverable?: boolean;
  forceHover?: boolean;
}

export const SVGIcon = ({
  dataTestId,
  onClick,
  className,
  icon,
  hoverable,
  forceHover,
}: ISVGIconProps) => {
  const [hovered, setHovered] = useState(false);

  const handleClick = (event: BaseSyntheticEvent) => {
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <img
      data-testid={dataTestId}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={($event) => handleClick($event)}
      className={`svg-icon ${className ?? ''} ${onClick ? 'clickable' : ''}`}
      src={`/assets/images/${icon}${
        hoverable && (hovered || forceHover) ? '-hovered' : ''
      }.svg`}
    />
  );

  // return (
  //   <div
  //
  //     onClick={($event) => handleClick($event)}
  //     className={`${className ?? ''} ${onClick ? 'clickable' : ''}`}>
  //     {icon()}
  //   </div>
  // );
};
