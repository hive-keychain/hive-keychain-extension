import React, { useState } from 'react';
import './custom-tooltip.component.scss';

interface TooltipProps {
  position?: 'top' | 'bottom' | 'left' | 'right';
  delayShow?: number;
  delayHide?: number;
  children: any;
  message: string;
}

export const CustomTooltip = (props: TooltipProps) => {
  const [isOpen, setOpen] = useState(false);

  const toggleOpen = (isOpen: boolean) => {
    if (!isOpen) {
      setTimeout(
        () => {
          setOpen(false);
        },
        props.delayHide ? props.delayHide : 0,
      );
    } else {
      setTimeout(
        () => {
          setOpen(true);
        },
        props.delayShow ? props.delayShow : 0,
      );
    }
  };

  return (
    <div
      className="tooltip-container"
      onMouseOver={() => toggleOpen(true)}
      onMouseOut={() => toggleOpen(false)}>
      <div className="tooltip-anchor">{props.children}</div>
      {isOpen && (
        <div className={`tooltip ${props.position ? props.position : 'top'}`}>
          {props.message}
        </div>
      )}
    </div>
  );
};
