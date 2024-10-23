import React from 'react';

interface CardProps {
  children: any;
}

export const Card = ({ children }: CardProps) => {
  return <div className="card-container">{children}</div>;
};
