import { Checkbox } from 'pretty-checkbox-react';
import React from 'react';
import './checkbox.component.scss';

interface CheckboxProps {
  onChange: (value: boolean) => void;
  title?: string;
  checked: boolean;
  skipTranslation?: boolean;
  hint?: string;
  skipHintTranslation?: boolean;
}

const CheckboxComponent = (props: CheckboxProps) => {
  return (
    <div className="checkbox-container">
      <div className="checkbox-and-label">
        <Checkbox
          checked={props.checked}
          onChange={() => props.onChange(!props.checked)}></Checkbox>
        <div className="label">
          {props.skipTranslation
            ? props.title
            : chrome.i18n.getMessage(props.title ?? '')}
        </div>
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

export default CheckboxComponent;
