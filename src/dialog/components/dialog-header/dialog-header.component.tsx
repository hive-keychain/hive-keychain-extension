import React from 'react';
import './dialog-header.component.scss';

type Props = { title: string };

const DialogHeader = ({ title }: Props) => {
  return <h2 className="dialog-header">{title}</h2>;
};

export default DialogHeader;
