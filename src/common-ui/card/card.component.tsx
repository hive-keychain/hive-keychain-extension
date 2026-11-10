import React from 'react';

interface CardProps {
  className?: string;
  children: any;
}

export const Card = ({ children, className }: CardProps) => {
  return <div className={`card-container ${className ?? ''}`}>{children}</div>;
};
