import React from 'react';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import { Icons } from 'src/common-ui/icons.enum';
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
  logo?: Icons | string;
  type?: ButtonType;
  fixToBottom?: boolean;
  dataTestId?: string;
  additionalClass?: string;
}

const ButtonComponent = (props: ButtonProps) => {
  return (
    <button
      data-testid={props.dataTestId}
      className={`submit-button ${
        props.type ? props.type : ButtonType.DEFAULT
      } ${props.fixToBottom ? 'fix-to-bottom' : ''} ${
        props.additionalClass ?? ''
      }`}
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
