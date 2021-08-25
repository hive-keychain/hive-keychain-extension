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
      checked={props.checked}>
      {props.skipTranslation
        ? props.title
        : chrome.i18n.getMessage(props.title)}
    </Switch>
  );
};

export default SwitchComponent;
