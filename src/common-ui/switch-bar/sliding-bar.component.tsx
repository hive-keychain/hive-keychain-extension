import React, { Fragment, useEffect, useState } from 'react';

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
              id={`radio-${index}`}
              name="tabs"
              checked={v.value === props.selectedValue}
              onChange={() => {
                props.onChange(v.value);
              }}
            />
            <label className="tab" htmlFor={`radio-${index}`}>
              {props.skipHintTranslation
                ? v.label
                : chrome.i18n.getMessage(v.label)}
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
