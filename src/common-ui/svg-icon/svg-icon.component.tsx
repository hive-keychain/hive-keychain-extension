import React, { BaseSyntheticEvent, useState } from 'react';
import { ReactSVG } from 'react-svg';
import { NewIcons } from 'src/common-ui/icons.enum';

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
    <>
      <ReactSVG
        className={`svg-icon ${className ?? ''} `}
        src={`/assets/images/${icon}.svg`}
        onClick={($event) => handleClick($event)}
      />

      {/* <object type="image/svg+xml" data={`/assets/images/${icon}.svg`}></object> */}

      {/* <img
        data-testid={dataTestId}
        onMouseOver={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={($event) => handleClick($event)}
        className={`svg-icon ${className ?? ''} ${onClick ? 'clickable' : ''}`}
        src={`/assets/images/${icon}${
          (hoverable && hovered) || forceHover ? '-hovered' : ''
        }.svg`}
      /> */}
    </>
  );
};
