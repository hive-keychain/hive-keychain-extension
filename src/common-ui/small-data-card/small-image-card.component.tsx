import React from 'react';

interface SmallImageCardProps {
  name?: string;
  value: string;
  valueOnClickAction?: (...params: any[]) => any;
  extraInfo?: string;
  extraInfoAdditionalClass?: string;
}

export const SmallImageCardComponent = ({
  name,
  value,
  valueOnClickAction,
  extraInfo,
  extraInfoAdditionalClass,
}: SmallImageCardProps) => {
  const handleOnValueClick = () => {
    if (valueOnClickAction) {
      valueOnClickAction();
    }
  };

  return (
    <div className="small-data-card">
      <div
        className={`value ${valueOnClickAction ? 'clickable' : ''}`}
        onClick={handleOnValueClick}>
        <img className="image" src={value} />
      </div>
      {name && <div className="label">{name}</div>}
      {extraInfo && (
        <div className={`extra-info ${extraInfoAdditionalClass ?? ''}`}>
          {extraInfo}
        </div>
      )}
    </div>
  );
};
