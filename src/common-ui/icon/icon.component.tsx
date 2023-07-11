import React from 'react';
import {
  CustomTooltip,
  CustomTooltipPosition,
} from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { Icons } from 'src/common-ui/icons.enum';
import './icon.component.scss';

interface IconProps {
  onClick?: (params: any) => void;
  name: Icons | string;
  additionalClassName?: string;
  tooltipMessage?: string;
  tooltipPosition?: CustomTooltipPosition;
  skipTooltipTranslation?: boolean;
  dataTestId?: string;
  containerAdditionalClassname?: string;
}

const getIconTemplate = (props: IconProps) => {
  return (
    <div
      className={`icon-container ${props.containerAdditionalClassname ?? ''}`}>
      <img
        src={`assets/images/${props.name}.svg`}
        data-testid={props.dataTestId}
        className={`${props.additionalClassName ?? ''} ${
          props.onClick ? 'clickable' : ''
        }`}
        onClick={props.onClick}
      />
    </div>
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
