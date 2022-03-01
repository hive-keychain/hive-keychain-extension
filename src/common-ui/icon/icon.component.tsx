import { Icons } from '@popup/icons.enum';
import React from 'react';
import './icon.component.scss';

export enum IconType {
  OUTLINED = '-outlined',
  STROKED = '',
}

interface IconProps {
  onClick?: (params: any) => void;
  name: Icons | string;
  type: IconType;
  additionalClassName?: string;
}

const Icon = (props: IconProps) => {
  return (
    <span
      className={`icon-component material-icons${props.type} ${
        props.additionalClassName ?? ''
      } ${props.onClick ? 'clickable' : ''}`}
      onClick={props.onClick}>
      {props.name}
    </span>
  );
};

export default Icon;
