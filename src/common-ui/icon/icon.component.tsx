import { Icons } from '@popup/icons.enum';
import React from 'react';
import ReactTooltip from 'react-tooltip';
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
}

const Icon = (props: IconProps) => {
  return (
    <>
      <span
        data-for={`icon-tooltip`}
        data-tip={
          props.tooltipMessage
            ? chrome.i18n.getMessage(props.tooltipMessage)
            : ''
        }
        data-iscapture="true"
        className={`icon-component material-icons${props.type} ${
          props.additionalClassName ?? ''
        } ${props.onClick ? 'clickable' : ''}`}
        onClick={props.onClick}>
        {props.name}
      </span>
      <ReactTooltip
        id="icon-tooltip"
        place="bottom"
        type="light"
        effect="solid"
        multiline={true}
      />
    </>
  );
};

export default Icon;
