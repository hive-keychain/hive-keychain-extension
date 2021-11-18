import { Switch } from 'pretty-checkbox-react';
import React from 'react';
import './switch.component.scss';

interface SwitchProps {
  onChange: (value: boolean) => void;
  title?: string;
  checked: boolean;
  skipTranslation?: boolean;
  hint?: string;
  skipHintTranslation?: boolean;
}

const SwitchComponent = (props: SwitchProps) => {
  return (
    <div className="switch-container">
      <Switch
        style={{ fontSize: 18 }}
        onChange={(e) => {
          props.onChange(e.target.checked);
        }}
        checked={props.checked}
        className={props.checked ? 'checked' : 'not-checked'}>
        {props.title && (
          <div>
            {props.skipTranslation
              ? props.title
              : chrome.i18n.getMessage(props.title)}
          </div>
        )}
      </Switch>
      {props.hint && (
        <div className="hint">
          {props.skipHintTranslation
            ? props.title
            : chrome.i18n.getMessage(props.hint)}
        </div>
      )}
    </div>
  );
};

export default SwitchComponent;
