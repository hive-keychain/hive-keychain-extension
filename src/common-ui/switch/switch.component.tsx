import { Switch } from 'pretty-checkbox-react';
import React from 'react';
import './switch.component.scss';

interface SwitchProps {
  onChange: (value: any) => void;
  selectedValue: any;
  leftValue: any;
  rightValue: any;
  leftValueLabel: string;
  rightValueLabel: string;
  skipLeftTranslation?: boolean;
  skipRightTranslation?: boolean;
  hint?: string;
  skipHintTranslation?: boolean;
}

const SwitchComponent = (props: SwitchProps) => {
  return (
    <div className="switch-container">
      <div className="switch-panel">
        <span>
          {props.skipLeftTranslation
            ? props.leftValueLabel
            : chrome.i18n.getMessage(props.leftValueLabel)}
        </span>
        <Switch
          style={{ fontSize: 18 }}
          onChange={(e) => {
            props.onChange(
              e.target.checked ? props.rightValue : props.leftValue,
            );
          }}
          checked={props.selectedValue === props.rightValue}
          className={
            props.selectedValue === props.rightValue ? 'checked' : 'not-checked'
          }></Switch>
        <span>
          {props.skipRightTranslation
            ? props.rightValueLabel
            : chrome.i18n.getMessage(props.rightValueLabel)}
        </span>
      </div>

      {props.hint && (
        <div className="hint">
          {props.skipHintTranslation
            ? props.hint
            : chrome.i18n.getMessage(props.hint)}
        </div>
      )}
    </div>
  );
};

export default SwitchComponent;
