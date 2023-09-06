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
  type?: IconType;
  additionalClassName?: string;
  tooltipMessage?: string;
  tooltipPosition?: CustomTooltipPosition;
  skipTooltipTranslation?: boolean;
  ariaLabel?: string;
  rotate?: boolean;
  dataTestId?: string;
}

const getIconTemplate = (props: IconProps) => {
  return (
    <span
      aria-label={props.ariaLabel}
      data-testid={props.dataTestId}
      className={`icon-component material-icons ${
        props.type ?? IconType.OUTLINED
      } ${props.additionalClassName ?? ''} ${
        props.onClick ? 'clickable' : ''
      } ${props.rotate ? 'rotate' : ''}`}
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
