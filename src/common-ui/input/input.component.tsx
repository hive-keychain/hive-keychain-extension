import React from 'react';
import { InputType } from './input-type.enum';
import './input.component.scss';

interface InputProps {
  onChange: (value: string) => void;
  value: string;
  logo?: string;
  placeholder: string;
  type: InputType;
  skipTranslation?: boolean;
  onEnterPress?(): any;
}

const InputComponent = (props: InputProps) => {
  return (
    <div className={`input-container ${props.logo ? '' : 'no-logo'}`}>
      <input
        type={props.type}
        placeholder={
          props.skipTranslation
            ? props.placeholder
            : chrome.i18n.getMessage(props.placeholder)
        }
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && props.onEnterPress) {
            props.onEnterPress();
          }
        }}
      />
      {props.logo && (
        <img src={`/assets/images/${props.logo}.png`} className="input-img" />
      )}
    </div>
  );
};

export default InputComponent;
