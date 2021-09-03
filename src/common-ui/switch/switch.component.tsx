import { Switch } from 'pretty-checkbox-react';
import React from 'react';
import './switch.component.scss';

interface SwitchProps {
  onChange: (value: boolean) => void;
  title: string;
  checked: boolean;
  skipTranslation?: boolean;
}

const SwitchComponent = (props: SwitchProps) => {
  return (
    <Switch
      style={{ fontSize: 18 }}
      onChange={(e) => {
        props.onChange(e.target.checked);
      }}
      checked={props.checked}
      className={props.checked ? 'checked' : 'not-checked'}>
      <div className="toto">
        {props.skipTranslation
          ? props.title
          : chrome.i18n.getMessage(props.title)}
      </div>
    </Switch>
  );
};

export default SwitchComponent;
