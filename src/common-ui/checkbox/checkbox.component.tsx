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
      <Checkbox
        checked={props.checked}
        onChange={() => props.onChange(!props.checked)}>
        {props.skipTranslation
          ? props.title
          : chrome.i18n.getMessage(props.title ?? '')}
      </Checkbox>
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

export default CheckboxComponent;
