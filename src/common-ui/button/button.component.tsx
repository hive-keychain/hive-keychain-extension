import React from 'react';
import './button.component.scss';

interface ButtonProps {
  onClick: () => void;
  label: string;
  labelParams?: string[];
  logo?: string;
  important?: boolean;
}

const ButtonComponent = (props: ButtonProps) => {
  return (
    <button
      className={`submit-button ${props.important ? 'important' : ''}`}
      onClick={props.onClick}>
      <div className="button-label">
        {chrome.i18n.getMessage(props.label, props.labelParams)}{' '}
      </div>
      {props.logo && (
        <span className="material-icons-outlined input-img">{props.logo}</span>
      )}
    </button>
  );
};

export default ButtonComponent;
