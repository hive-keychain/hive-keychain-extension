import { Icons } from '@popup/icons.enum';
import React from 'react';
import {
  CustomTooltip,
  CustomTooltipPosition,
} from 'src/common-ui/custom-tooltip/custom-tooltip.component';
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
  tooltipMessage?: string;
  tooltipPosition?: CustomTooltipPosition;
  skipTooltipTranslation?: boolean;
  dataTestId?: string;
}

const getIconTemplate = (props: IconProps) => {
  return (
    <span
      data-testid={props.dataTestId}
      className={`icon-component material-icons${props.type} ${
        props.additionalClassName ?? ''
      } ${props.onClick ? 'clickable' : ''}`}
      onClick={props.onClick}>
      {props.name}
    </span>
  );
};

const Icon = (props: IconProps) => {
  if (!props.tooltipMessage) {
    return getIconTemplate(props);
  }
  return (
    <CustomTooltip
      message={props.tooltipMessage}
      position={props.tooltipPosition}
      skipTranslation={props.skipTooltipTranslation}>
      {getIconTemplate(props)}
    </CustomTooltip>
  );
};

export default Icon;
