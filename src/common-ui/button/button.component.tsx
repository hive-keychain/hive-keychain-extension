import React from 'react';
import { NewIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import './button.component.scss';

export enum ButtonType {
  STROKED = 'stroked',
  RAISED = 'raised',
  IMPORTANT = 'important',
  DEFAULT = 'default',
  REVERSE = 'reverse',
  NO_BORDER = 'no-border',
}

export interface ButtonProps {
  onClick: () => void;
  label: string;
  skipLabelTranslation?: boolean;
  labelParams?: string[];
  logo?: NewIcons;
  type?: ButtonType;
  fixToBottom?: boolean;
  dataTestId?: string;
  additionalClass?: string;
  height?: 'tall' | 'medium' | 'small';
}

const ButtonComponent = (props: ButtonProps) => {
  return (
    <button
      data-testid={props.dataTestId}
      className={`submit-button ${
        props.type ? props.type : ButtonType.DEFAULT
      } ${props.fixToBottom ? 'fix-to-bottom' : ''} ${
        props.additionalClass ?? ''
      } ${props.height ?? 'medium'}`}
      onClick={props.onClick}>
      <div className="button-label">
        {props.skipLabelTranslation
          ? props.label
          : chrome.i18n.getMessage(props.label, props.labelParams)}{' '}
      </div>
      {props.logo && <SVGIcon icon={props.logo} className="logo" />}
    </button>
  );
};

export default ButtonComponent;
