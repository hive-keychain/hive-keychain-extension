import React from 'react';
import './button.component.scss';

interface ButtonProps {
  onClick: () => void;
  label: string;
  logo?: string;
  important?: boolean;
}

const ButtonComponent = (props: ButtonProps) => {
  return (
    <button
      className={`submit-button ${props.important ? 'important' : ''}`}
      onClick={props.onClick}>
      <div className="button-label">{chrome.i18n.getMessage(props.label)} </div>
      {props.logo && (
        <img className="logo" src={`/assets/images/${props.logo}.png`} />
      )}
    </button>
  );
};

export default ButtonComponent;
