import React from 'react';

interface SeparatorProps {
  type: 'vertical' | 'horizontal';
  fullSize?: boolean;
}

export const Separator = (props: SeparatorProps) => (
  <div
    className={`separator ${props.type} ${
      props.fullSize ? 'full-size' : ''
    }`}></div>
);
