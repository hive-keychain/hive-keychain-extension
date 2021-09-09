import React from 'react';
import { InputType } from './input-type.enum';
import './input.component.scss';

interface InputProps {
  onChange: (value: any) => void;
  value: any;
  logo?: string;
  placeholder: string;
  type: InputType;
  step?: number;
  min?: number;
  skipTranslation?: boolean;
  hint?: string;
  skipHintTranslation?: boolean;
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
        step={props.step}
        min={props.min}
        onChange={(e) => props.onChange(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && props.onEnterPress) {
            props.onEnterPress();
          }
        }}
      />
      {props.hint && (
        <div className="hint">
          {props.skipHintTranslation
            ? props.hint
            : chrome.i18n.getMessage(props.hint)}
        </div>
      )}
      {props.logo && (
        <img src={`/assets/images/${props.logo}.png`} className="input-img" />
      )}
    </div>
  );
};

export default InputComponent;
