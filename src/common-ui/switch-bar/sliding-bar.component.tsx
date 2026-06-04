import React, { Fragment, useEffect, useState } from 'react';

import { I18nUtils } from 'src/utils/i18n.utils';
interface SlidingBarValue {
  value: any;
  label: string;
  skipLabelTranslation?: boolean;
}

interface SlidingBarProps {
  onChange: (value: any) => void;
  selectedValue: any;
  values: SlidingBarValue[];
  hint?: string;
  skipHintTranslation?: boolean;
  dataTestId?: string;
  id: string;
}

export const SlidingBarComponent = (props: SlidingBarProps) => {
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);

  useEffect(() => {
    const index = props.values.findIndex(
      (item) => item.value === props.selectedValue,
    );
    setSelectedItemIndex(index);
  }, [props.selectedValue]);

  return (
    <div className="sliding-bar-container">
      <div className="tabs">
        {props.values.map((v, index) => (
          <Fragment key={`input-${index}`}>
            <input
              style={{}}
              type="radio"
              id={`${props.id}-radio-${index}`}
              name="tabs"
              checked={v.value === props.selectedValue}
              onChange={() => {
                props.onChange(v.value);
              }}
            />
            <label
              className={`tab ${
                v.value === props.selectedValue ? 'selected' : ''
              }`}
              htmlFor={`${props.id}-radio-${index}`}>
              {v.skipLabelTranslation
                ? v.label
                : I18nUtils.getMessage(v.label)}
            </label>
          </Fragment>
        ))}
        <span
          className="glider"
          style={{
            transform: `translateX(calc(${selectedItemIndex * 100}%))`,
          }}></span>
      </div>
    </div>
  );
};
