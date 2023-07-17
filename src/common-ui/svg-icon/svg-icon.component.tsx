import React, { BaseSyntheticEvent } from 'react';

interface ISVGIconProps {
  dataTestId?: string;
  onClick?: (...params: any) => void;
  className?: string;
  icon: any;
}

export const SVGIcon = ({
  dataTestId,
  onClick,
  className,
  icon,
}: ISVGIconProps) => {
  const handleClick = (event: BaseSyntheticEvent) => {
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <div
      data-testid={dataTestId}
      onClick={($event) => handleClick($event)}
      className={`${className ?? ''} ${onClick ? 'clickable' : ''}`}>
      {icon()}
    </div>
  );
};
