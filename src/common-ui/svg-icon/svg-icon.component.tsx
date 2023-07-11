import React from 'react';

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
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      data-testid={dataTestId}
      onClick={() => handleClick()}
      className={`${className ?? ''} ${onClick ? 'clickable' : ''}`}>
      {icon()}
    </div>
  );
};
