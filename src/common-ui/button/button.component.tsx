import { Icons } from '@popup/icons.enum';
import React from 'react';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import './button.component.scss';

export enum ButtonType {
  STROKED = 'stroked',
  RAISED = 'raised',
  IMPORTANT = 'important',
  DEFAULT = 'default',
  REVERSE = 'reverse',
}

export interface ButtonProps {
  onClick: () => void;
  label: string;
  skipLabelTranslation?: boolean;
  labelParams?: string[];
  logo?: Icons | string;
  type?: ButtonType;
  fixToBottom?: boolean;
  ariaLabel?: string;
}

const ButtonComponent = (props: ButtonProps) => {
  return (
    <button
      aria-label={props.ariaLabel}
      className={`submit-button ${
        props.type ? props.type : ButtonType.DEFAULT
      } ${props.fixToBottom ? 'fix-to-bottom' : ''}`}
      onClick={props.onClick}>
      <div className="button-label">
        {props.skipLabelTranslation
          ? props.label
          : chrome.i18n.getMessage(props.label, props.labelParams)}{' '}
      </div>
      {props.logo && (
        <Icon
          name={props.logo}
          type={IconType.OUTLINED}
          additionalClassName="logo"></Icon>
      )}
    </button>
  );
};

export default ButtonComponent;
