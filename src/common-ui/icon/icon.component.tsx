import React from 'react';
import {
  CustomTooltip,
  CustomTooltipPosition,
} from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { Icons, NewIcons } from 'src/common-ui/icons.enum';
import './icon.component.scss';

interface IconProps {
  onClick?: (params: any) => void;
  name: Icons | string | NewIcons;
  additionalClassName?: string;
  tooltipMessage?: string;
  tooltipPosition?: CustomTooltipPosition;
  skipTooltipTranslation?: boolean;
  dataTestId?: string;
}

const getIconTemplate = (props: IconProps) => {
  return (
    <div className={`icon-container`}>
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
