import React from 'react';
import './dialog-header.component.scss';

type Props = { title: string; ariaLabel?: string };

const DialogHeader = ({ title, ariaLabel }: Props) => {
  return (
    <h2 aria-label={`dialog-header-${ariaLabel}`} className="dialog-header">
      {title}
    </h2>
  );
};

export default DialogHeader;
