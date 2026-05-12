import React from 'react';

interface SmallDataCardProps {
  label: string;
  skipLabelTranslation?: boolean;
  value: any;
  valueClassName?: string;
  valueOnClickAction?: (...params: any[]) => any;
  extraInfo?: string;
  extraInfoAdditionalClass?: string;
}

export const SmallDataCardComponent = ({
  label,
  skipLabelTranslation,
  value,
  valueClassName,
  valueOnClickAction,
  extraInfo,
  extraInfoAdditionalClass,
}: SmallDataCardProps) => {
  const handleOnValueClick = () => {
    if (valueOnClickAction) {
      valueOnClickAction();
    }
  };

  return (
    <div className="small-data-card">
      <div className="label">
        {skipLabelTranslation ? label : chrome.i18n.getMessage(label)}
      </div>
      <div
        className={`value ${valueClassName ?? ''} ${
          valueOnClickAction ? 'clickable' : ''
        }`}
        onClick={handleOnValueClick}>
        {value}
      </div>
      {extraInfo && (
        <div className={`extra-info ${extraInfoAdditionalClass ?? ''}`}>
          {extraInfo}
        </div>
      )}
    </div>
  );
};
